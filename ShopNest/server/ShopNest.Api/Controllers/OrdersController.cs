using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopNest.Api.Data;
using ShopNest.Api.DTOs;
using ShopNest.Api.Models;

namespace ShopNest.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OrdersController(AppDbContext db) : ControllerBase
{
    [HttpPost("checkout")]
    public async Task<ActionResult<OrderResponse>> Checkout(CheckoutRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var groupedItems = request.Items
            .GroupBy(i => i.ProductId)
            .Select(g => new CheckoutItemRequest
            {
                ProductId = g.Key,
                Quantity = g.Sum(x => x.Quantity)
            })
            .ToList();

        if (groupedItems.Any(i => i.Quantity > 20))
            return BadRequest(new { message = "A maximum of 20 units per product can be ordered at once." });

        await using var transaction = await db.Database.BeginTransactionAsync();

        var productIds = groupedItems.Select(i => i.ProductId).ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        if (products.Count != productIds.Distinct().Count())
            return BadRequest(new { message = "One or more products are unavailable." });

        var order = new Order
        {
            OrderNumber = $"SN{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}",
            UserId = userId,
            CustomerName = request.CustomerName.Trim(),
            Email = request.Email.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),
            PostalCode = request.PostalCode.Trim(),
            PaymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "Mock Card" : request.PaymentMethod.Trim()
        };

        foreach (var requestedItem in groupedItems)
        {
            var product = products.Single(p => p.Id == requestedItem.ProductId);
            if (product.Stock < requestedItem.Quantity)
                return BadRequest(new { message = $"Only {product.Stock} unit(s) of {product.Name} are available." });

            product.Stock -= requestedItem.Quantity;
            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ImageUrl = product.ImageUrl,
                UnitPrice = product.Price,
                Quantity = requestedItem.Quantity
            });
        }

        order.Total = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(ToResponse(order));
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var orders = await db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var order = await db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return NotFound(new { message = "Order not found." });
        if (!isAdmin && order.UserId != userId) return Forbid();

        return Ok(ToResponse(order));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = db.Orders.AsNoTracking().Include(o => o.Items).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var parsed))
            query = query.Where(o => o.Status == parsed);

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(ToResponse));
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("admin/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusRequest request)
    {
        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            return BadRequest(new { message = "Invalid order status." });

        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return NotFound(new { message = "Order not found." });

        if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Delivered)
            return BadRequest(new { message = "Completed or cancelled orders cannot be changed." });

        if (status == OrderStatus.Cancelled)
        {
            foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
            {
                var product = await db.Products.FindAsync(item.ProductId!.Value);
                if (product is not null) product.Stock += item.Quantity;
            }
        }

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(ToResponse(order));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalOrders = await db.Orders.CountAsync();
        var totalProducts = await db.Products.CountAsync(p => p.IsActive);
        var totalCustomers = await db.Users.CountAsync();
        var revenue = await db.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.Total) ?? 0;
        var pendingOrders = await db.Orders.CountAsync(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled);
        var lowStock = await db.Products.CountAsync(p => p.IsActive && p.Stock <= 10);

        var recentOrders = await db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .ToListAsync();

        return Ok(new
        {
            totalOrders,
            totalProducts,
            totalCustomers,
            revenue,
            pendingOrders,
            lowStock,
            recentOrders = recentOrders.Select(ToResponse)
        });
    }

    private static OrderResponse ToResponse(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        CustomerName = order.CustomerName,
        Email = order.Email,
        Address = order.Address,
        City = order.City,
        PostalCode = order.PostalCode,
        PaymentMethod = order.PaymentMethod,
        Total = order.Total,
        Status = order.Status.ToString(),
        CreatedAt = order.CreatedAt,
        UpdatedAt = order.UpdatedAt,
        Items = order.Items.Select(i => new OrderItemResponse
        {
            ProductId = i.ProductId ?? 0,
            ProductName = i.ProductName,
            ImageUrl = i.ImageUrl,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity
        }).ToList()
    };
}
