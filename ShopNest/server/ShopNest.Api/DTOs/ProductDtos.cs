using System.ComponentModel.DataAnnotations;

namespace ShopNest.Api.DTOs;

public class ProductRequest
{
    [Required, MinLength(2), MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MinLength(10), MaxLength(1500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 10000000)]
    public decimal Price { get; set; }

    [Required, Url]
    public string ImageUrl { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Category { get; set; } = string.Empty;

    [Range(0, 1000000)]
    public int Stock { get; set; }

    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
}
