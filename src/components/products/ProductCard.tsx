"use client";

import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Clock, Wrench, CheckCircle, XCircle } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "Moderate":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Difficult":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPartSelectUrl = () => {
    if (product.url) {
      return product.url;
    }
    const slugifiedName = product.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const mfgPart = product.manufacturerPartNumber || '';
    return `https://www.partselect.com/${product.partNumber}-${product.brand}-${mfgPart}-${slugifiedName}.htm`;
  };

  const handleViewDetails = () => {
    window.open(getPartSelectUrl(), "_blank");
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
              {product.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1">Part #{product.partNumber}</p>
          </div>
          <div className="ml-2">
            {product.inStock ? (
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                <CheckCircle size={10} />
                In Stock
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                <XCircle size={10} />
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewCount.toLocaleString()})</span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">Sale</Badge>
            </>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={`${getDifficultyColor(product.installationDifficulty)} text-xs px-2 py-0.5`}>
            <Wrench size={10} className="mr-1" />
            {product.installationDifficulty}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
            <Clock size={10} className="mr-1" />
            {product.installationTime}
          </Badge>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleViewDetails}
          className="w-full h-9 text-sm border-gray-300 hover:bg-gray-50"
          aria-label={`View ${product.name} details`}
        >
          <ExternalLink size={16} className="mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
