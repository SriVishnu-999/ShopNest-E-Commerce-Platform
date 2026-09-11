using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ShopNest.Api.Models;

namespace ShopNest.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await db.Database.EnsureCreatedAsync();

        foreach (var role in new[] { "Admin", "Customer" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        await CreateUserIfMissing(userManager, "admin@shopnest.local", "ShopNest Admin", "Admin@123!", "Admin");
        await CreateUserIfMissing(userManager, "customer@shopnest.local", "Demo Customer", "Customer@123!", "Customer");

        if (await db.Products.AnyAsync()) return;

        var products = new List<Product>
        {
            new() { Name="AeroPulse Wireless Headphones", Description="Premium over-ear headphones with active noise cancellation, spatial audio, soft memory-foam cushions and up to 38 hours of battery life.", Price=8999, Category="Electronics", Stock=32, IsFeatured=true, ImageUrl="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="NovaFit Smartwatch", Description="AMOLED smartwatch with health tracking, GPS, workout modes, notification support and a refined aluminium case for everyday wear.", Price=12999, Category="Electronics", Stock=18, IsFeatured=true, ImageUrl="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="Arc Mechanical Keyboard", Description="Compact mechanical keyboard with tactile switches, hot-swappable keys, subtle RGB backlight and multi-device connectivity.", Price=6499, Category="Electronics", Stock=24, ImageUrl="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="Orbit Pro Gaming Mouse", Description="Lightweight ergonomic gaming mouse with a high-precision sensor, programmable buttons and low-latency wireless performance.", Price=3499, Category="Electronics", Stock=41, ImageUrl="https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="Metro Everyday Backpack", Description="Minimal water-resistant backpack with a padded laptop sleeve, organized interior and breathable straps for work or travel.", Price=2799, Category="Fashion", Stock=50, IsFeatured=true, ImageUrl="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="Velocity Runner Sneakers", Description="Responsive everyday sneakers with breathable engineered mesh, cushioned midsoles and a durable traction outsole.", Price=4999, Category="Fashion", Stock=27, ImageUrl="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="Classic Steel Chronograph", Description="Clean stainless-steel chronograph with a textured dial, durable mineral glass and interchangeable leather strap.", Price=7299, Category="Fashion", Stock=14, ImageUrl="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="Nordic Desk Lamp", Description="Adjustable metal desk lamp with warm focused lighting and a minimal silhouette designed for modern workspaces.", Price=1899, Category="Home", Stock=36, IsFeatured=true, ImageUrl="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="Stoneware Coffee Set", Description="Hand-finished stoneware coffee set with four cups and matching saucers, designed for a warm contemporary table setting.", Price=2199, Category="Home", Stock=21, ImageUrl="https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="CloudSoft Throw Blanket", Description="Soft textured throw blanket made for couches and beds, with a lightweight breathable weave and neutral modern finish.", Price=1699, Category="Home", Stock=45, ImageUrl="https://images.unsplash.com/photo-1583845112203-454c2254ed97?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="CoreFlex Yoga Mat", Description="High-grip exercise mat with comfortable cushioning, alignment markings and an easy-carry strap for home or studio workouts.", Price=1499, Category="Fitness", Stock=39, ImageUrl="https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=80" },
            new() { Name="HydraSteel Bottle", Description="Double-wall insulated stainless-steel bottle that keeps drinks cold or hot for hours and fits standard cup holders.", Price=1199, Category="Fitness", Stock=60, ImageUrl="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80" }
        };

        db.Products.AddRange(products);
        await db.SaveChangesAsync();
    }

    private static async Task CreateUserIfMissing(
        UserManager<ApplicationUser> userManager,
        string email,
        string fullName,
        string password,
        string role)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is not null) return;

        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, role);
    }
}
