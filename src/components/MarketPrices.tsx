import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, TrendingUp, TrendingDown, MapPin } from "lucide-react";
import { toast } from "sonner";

const MarketPrices = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [isAddingPrice, setIsAddingPrice] = useState(false);

  const [newPrice, setNewPrice] = useState({
    produce_name: "",
    price_per_kg: "",
    market_name: "",
    location: ""
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const { data, error } = await supabase
      .from("market_prices")
      .select("*")
      .order("recorded_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch market prices");
      return;
    }

    setPrices(data || []);
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("market_prices")
      .insert({
        ...newPrice,
        price_per_kg: parseFloat(newPrice.price_per_kg)
      });

    if (error) {
      toast.error("Failed to add market price");
      return;
    }

    toast.success("Market price added successfully");
    setIsAddingPrice(false);
    setNewPrice({ produce_name: "", price_per_kg: "", market_name: "", location: "" });
    fetchPrices();
  };

  // Group prices by produce name
  const groupedPrices = prices.reduce((acc: any, price) => {
    if (!acc[price.produce_name]) {
      acc[price.produce_name] = [];
    }
    acc[price.produce_name].push(price);
    return acc;
  }, {});

  const getAveragePrice = (producePrices: any[]) => {
    const sum = producePrices.reduce((acc, p) => acc + parseFloat(p.price_per_kg), 0);
    return (sum / producePrices.length).toFixed(2);
  };

  const getPriceTrend = (producePrices: any[]) => {
    if (producePrices.length < 2) return null;
    
    const sortedPrices = [...producePrices].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    
    const oldPrice = parseFloat(sortedPrices[0].price_per_kg);
    const newPrice = parseFloat(sortedPrices[sortedPrices.length - 1].price_per_kg);
    
    if (newPrice > oldPrice) return "up";
    if (newPrice < oldPrice) return "down";
    return "stable";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Market Prices</h2>
          <p className="text-muted-foreground">Real-time mandi price information</p>
        </div>
        <Dialog open={isAddingPrice} onOpenChange={setIsAddingPrice}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Price Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Market Price</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPrice} className="space-y-4">
              <div>
                <Label htmlFor="produce">Produce Name</Label>
                <Input
                  id="produce"
                  value={newPrice.produce_name}
                  onChange={(e) => setNewPrice({ ...newPrice, produce_name: e.target.value })}
                  placeholder="e.g., Tomatoes"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price per kg (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newPrice.price_per_kg}
                  onChange={(e) => setNewPrice({ ...newPrice, price_per_kg: e.target.value })}
                  placeholder="e.g., 35.50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="market">Market Name</Label>
                <Input
                  id="market"
                  value={newPrice.market_name}
                  onChange={(e) => setNewPrice({ ...newPrice, market_name: e.target.value })}
                  placeholder="e.g., Azadpur Mandi"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newPrice.location}
                  onChange={(e) => setNewPrice({ ...newPrice, location: e.target.value })}
                  placeholder="e.g., Delhi"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Add Price Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedPrices).length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No market prices available</p>
          <Button onClick={() => setIsAddingPrice(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Price Entry
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.entries(groupedPrices).map(([produceName, producePrices]: [string, any]) => {
            const avgPrice = getAveragePrice(producePrices);
            const trend = getPriceTrend(producePrices);

            return (
              <Card key={produceName} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl">{produceName}</CardTitle>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">₹{avgPrice}</p>
                      <p className="text-sm text-muted-foreground">avg. per kg</p>
                    </div>
                  </div>
                  {trend && (
                    <div className="flex items-center gap-2 mt-2">
                      {trend === "up" ? (
                        <>
                          <TrendingUp className="h-5 w-5 text-destructive" />
                          <span className="text-sm text-destructive font-medium">Price increasing</span>
                        </>
                      ) : trend === "down" ? (
                        <>
                          <TrendingDown className="h-5 w-5 text-success" />
                          <span className="text-sm text-success font-medium">Price decreasing</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground font-medium">Price stable</span>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {producePrices.map((price: any) => (
                      <div 
                        key={price.id} 
                        className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{price.market_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {price.location}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(price.recorded_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">₹{price.price_per_kg}</p>
                          <p className="text-xs text-muted-foreground">per kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketPrices;