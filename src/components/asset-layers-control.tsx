'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Layers } from "lucide-react";
import { Label } from "./ui/label";

export type ActiveLayers = {
    ndwi: boolean;
    forest: boolean;
    agriculture: boolean;
}

type AssetLayersControlProps = {
    activeLayers: ActiveLayers;
    onActiveLayersChange: (layers: ActiveLayers) => void;
};

export function AssetLayersControl({ activeLayers, onActiveLayersChange }: AssetLayersControlProps) {
    
    const handleCheckedChange = (layer: keyof ActiveLayers) => (checked: boolean) => {
        onActiveLayersChange({
            ...activeLayers,
            [layer]: checked,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white hover:bg-gray-100">
                    <Layers className="mr-2 h-4 w-4" />
                    Asset Layers
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Toggle Layers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox id="ndwi" checked={activeLayers.ndwi} onCheckedChange={handleCheckedChange('ndwi')} />
                    <Label htmlFor="ndwi" className="ml-2">NDWI (Water Availability)</Label>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox id="forest" checked={activeLayers.forest} onCheckedChange={handleCheckedChange('forest')} />
                    <Label htmlFor="forest" className="ml-2">Forest Cover</Label>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox id="agriculture" checked={activeLayers.agriculture} onCheckedChange={handleCheckedChange('agriculture')} />
                    <Label htmlFor="agriculture" className="ml-2">Agricultural Land</Label>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
