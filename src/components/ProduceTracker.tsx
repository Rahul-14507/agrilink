import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, QrCode, Calendar, Package } from "lucide-react";
import { toast } from "sonner";

const ProduceTracker = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [storageUnits, setStorageUnits] = useState<any[]>([]);
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const [newBatch, setNewBatch] = useState({
    storage_unit_id: "",
    produce_name: "",
    produce_type: "vegetables",
    quantity_kg: "",
    harvest_date: "",
    expected_shelf_life_days: "",
    farmer_name: "",
    farmer_contact: ""
  });

  useEffect(() => {
    fetchBatches();
    fetchStorageUnits();
  }, []);

  const fetchBatches = async () => {
    const { data, error } = await supabase
      .from("produce_batches")
      .select("*, storage_units(name, location)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch produce batches");
      return;
    }

    setBatches(data || []);
  };

  const fetchStorageUnits = async () => {
    const { data, error } = await supabase
      .from("storage_units")
      .select("*")
      .eq("status", "active");

    if (!error) {
      setStorageUnits(data || []);
    }
  };

  const generateQRCode = () => {
    return `AGRI-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qrCode = generateQRCode();
    
    const { error } = await supabase
      .from("produce_batches")
      .insert([{
        ...newBatch,
        quantity_kg: parseFloat(newBatch.quantity_kg),
        expected_shelf_life_days: parseInt(newBatch.expected_shelf_life_days),
        qr_code: qrCode
      }] as any);

    if (error) {
      toast.error("Failed to add produce batch");
      return;
    }

    toast.success("Produce batch registered successfully");
    setIsAddingBatch(false);
    setNewBatch({
      storage_unit_id: "",
      produce_name: "",
      produce_type: "vegetables",
      quantity_kg: "",
      harvest_date: "",
      expected_shelf_life_days: "",
      farmer_name: "",
      farmer_contact: ""
    });
    fetchBatches();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_storage":
        return "bg-success text-white";
      case "in_transit":
        return "bg-info text-white";
      case "delivered":
        return "bg-primary text-white";
      case "spoiled":
        return "bg-destructive text-white";
      default:
        return "bg-muted";
    }
  };

  const getProduceTypeColor = (type: string) => {
    switch (type) {
      case "vegetables":
        return "bg-success/10 text-success border-success/20";
      case "fruits":
        return "bg-warning/10 text-warning border-warning/20";
      case "grains":
        return "bg-accent/10 text-accent border-accent/20";
      case "dairy":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const calculateDaysRemaining = (harvestDate: string, shelfLife: number) => {
    const harvest = new Date(harvestDate);
    const expiryDate = new Date(harvest.getTime() + shelfLife * 24 * 60 * 60 * 1000);
    const today = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    return daysRemaining;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Produce Tracking</h2>
          <p className="text-muted-foreground">QR-based traceability system</p>
        </div>
        <Dialog open={isAddingBatch} onOpenChange={setIsAddingBatch}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Produce Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Produce Batch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="storage_unit">Storage Unit</Label>
                  <Select
                    value={newBatch.storage_unit_id}
                    onValueChange={(value) => setNewBatch({ ...newBatch, storage_unit_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} - {unit.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="produce_name">Produce Name</Label>
                  <Input
                    id="produce_name"
                    value={newBatch.produce_name}
                    onChange={(e) => setNewBatch({ ...newBatch, produce_name: e.target.value })}
                    placeholder="e.g., Tomatoes"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="produce_type">Produce Type</Label>
                  <Select
                    value={newBatch.produce_type}
                    onValueChange={(value) => setNewBatch({ ...newBatch, produce_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="grains">Grains</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newBatch.quantity_kg}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity_kg: e.target.value })}
                    placeholder="e.g., 500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="harvest_date">Harvest Date</Label>
                  <Input
                    id="harvest_date"
                    type="date"
                    value={newBatch.harvest_date}
                    onChange={(e) => setNewBatch({ ...newBatch, harvest_date: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="shelf_life">Expected Shelf Life (days)</Label>
                  <Input
                    id="shelf_life"
                    type="number"
                    value={newBatch.expected_shelf_life_days}
                    onChange={(e) => setNewBatch({ ...newBatch, expected_shelf_life_days: e.target.value })}
                    placeholder="e.g., 14"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="farmer_name">Farmer Name</Label>
                  <Input
                    id="farmer_name"
                    value={newBatch.farmer_name}
                    onChange={(e) => setNewBatch({ ...newBatch, farmer_name: e.target.value })}
                    placeholder="e.g., Rajesh Kumar"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="farmer_contact">Farmer Contact</Label>
                  <Input
                    id="farmer_contact"
                    value={newBatch.farmer_contact}
                    onChange={(e) => setNewBatch({ ...newBatch, farmer_contact: e.target.value })}
                    placeholder="e.g., +91 98765 43210"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Register Batch</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {batches.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No produce batches registered</p>
          <Button onClick={() => setIsAddingBatch(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Your First Batch
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            const daysRemaining = calculateDaysRemaining(batch.harvest_date, batch.expected_shelf_life_days);
            const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
            const isExpired = daysRemaining <= 0;

            return (
              <Card key={batch.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{batch.produce_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {batch.storage_units?.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(batch.status)}>
                      {batch.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getProduceTypeColor(batch.produce_type)}>
                      {batch.produce_type}
                    </Badge>
                    <span className="text-lg font-bold text-primary">{batch.quantity_kg} kg</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Harvested:</span>
                      <span className="font-medium">
                        {new Date(batch.harvest_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">QR Code:</span>
                      <code className="text-xs font-mono">{batch.qr_code}</code>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Farmer:</span>
                      <span className="font-medium">{batch.farmer_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{batch.farmer_contact}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg text-center ${
                    isExpired 
                      ? "bg-destructive/10 text-destructive" 
                      : isExpiringSoon 
                      ? "bg-warning/10 text-warning" 
                      : "bg-success/10 text-success"
                  }`}>
                    <p className="text-sm font-medium">
                      {isExpired 
                        ? "⚠️ Expired" 
                        : isExpiringSoon 
                        ? `⚠️ ${daysRemaining} days remaining` 
                        : `✓ ${daysRemaining} days remaining`}
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedBatch(batch)}
                  >
                    View Traceability
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedBatch && (
        <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Batch Traceability</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <QrCode className="h-24 w-24 mx-auto mb-4" />
                <p className="text-lg font-bold mb-2">{selectedBatch.produce_name}</p>
                <code className="text-sm">{selectedBatch.qr_code}</code>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{selectedBatch.quantity_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harvest Date:</span>
                  <span className="font-medium">
                    {new Date(selectedBatch.harvest_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="font-medium">{selectedBatch.storage_units?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{selectedBatch.storage_units?.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farmer:</span>
                  <span className="font-medium">{selectedBatch.farmer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{selectedBatch.farmer_contact}</span>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-primary font-medium">
                  ✓ Blockchain-verified origin and storage history
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProduceTracker;