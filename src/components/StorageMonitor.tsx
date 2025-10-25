import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Thermometer, Droplets, Weight, Plus, Activity } from "lucide-react";
import { toast } from "sonner";

const StorageMonitor = () => {
  const [storageUnits, setStorageUnits] = useState<any[]>([]);
  const [sensorReadings, setSensorReadings] = useState<Record<string, any>>({});
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingReading, setIsAddingReading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const [newUnit, setNewUnit] = useState({
    name: "",
    location: "",
    capacity_kg: "",
    status: "active"
  });

  const [newReading, setNewReading] = useState({
    temperature_celsius: "",
    humidity_percent: "",
    weight_kg: ""
  });

  useEffect(() => {
    fetchStorageUnits();
  }, []);

  const fetchStorageUnits = async () => {
    const { data, error } = await supabase
      .from("storage_units")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch storage units");
      return;
    }

    setStorageUnits(data || []);
    
    // Fetch latest sensor reading for each unit
    for (const unit of data || []) {
      fetchLatestReading(unit.id);
    }
  };

  const fetchLatestReading = async (unitId: string) => {
    const { data, error } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("storage_unit_id", unitId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setSensorReadings(prev => ({ ...prev, [unitId]: data }));
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("storage_units")
      .insert([{
        ...newUnit,
        capacity_kg: parseFloat(newUnit.capacity_kg)
      }] as any);

    if (error) {
      toast.error("Failed to add storage unit");
      return;
    }

    toast.success("Storage unit added successfully");
    setIsAddingUnit(false);
    setNewUnit({ name: "", location: "", capacity_kg: "", status: "active" });
    fetchStorageUnits();
  };

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("sensor_readings")
      .insert({
        storage_unit_id: selectedUnit,
        temperature_celsius: parseFloat(newReading.temperature_celsius),
        humidity_percent: parseFloat(newReading.humidity_percent),
        weight_kg: parseFloat(newReading.weight_kg)
      });

    if (error) {
      toast.error("Failed to add sensor reading");
      return;
    }

    toast.success("Sensor reading added successfully");
    setIsAddingReading(false);
    setNewReading({ temperature_celsius: "", humidity_percent: "", weight_kg: "" });
    fetchLatestReading(selectedUnit);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-white";
      case "maintenance":
        return "bg-warning text-white";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 2) return { color: "text-info", status: "Too Cold" };
    if (temp > 8) return { color: "text-destructive", status: "Too Warm" };
    return { color: "text-success", status: "Optimal" };
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 85) return { color: "text-warning", status: "Low" };
    if (humidity > 95) return { color: "text-warning", status: "High" };
    return { color: "text-success", status: "Optimal" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Cold Storage Monitoring</h2>
          <p className="text-muted-foreground">Real-time IoT sensor data</p>
        </div>
        <Dialog open={isAddingUnit} onOpenChange={setIsAddingUnit}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Storage Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Storage Unit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <Label htmlFor="name">Unit Name</Label>
                <Input
                  id="name"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  placeholder="e.g., Cold Storage A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newUnit.location}
                  onChange={(e) => setNewUnit({ ...newUnit, location: e.target.value })}
                  placeholder="e.g., Warehouse 1, Delhi"
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (kg)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newUnit.capacity_kg}
                  onChange={(e) => setNewUnit({ ...newUnit, capacity_kg: e.target.value })}
                  placeholder="e.g., 1000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newUnit.status} onValueChange={(value) => setNewUnit({ ...newUnit, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Storage Unit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {storageUnits.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No storage units found</p>
          <Button onClick={() => setIsAddingUnit(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Storage Unit
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {storageUnits.map((unit) => {
            const reading = sensorReadings[unit.id];
            const tempStatus = reading ? getTemperatureStatus(reading.temperature_celsius) : null;
            const humidityStatus = reading ? getHumidityStatus(reading.humidity_percent) : null;

            return (
              <Card key={unit.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{unit.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{unit.location}</p>
                    </div>
                    <Badge className={getStatusColor(unit.status)}>
                      {unit.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{unit.capacity_kg} kg</span>
                  </div>

                  {reading ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center space-y-1">
                          <Thermometer className={`h-5 w-5 mx-auto ${tempStatus?.color}`} />
                          <p className="text-2xl font-bold">{reading.temperature_celsius}°C</p>
                          <p className="text-xs text-muted-foreground">{tempStatus?.status}</p>
                        </div>
                        <div className="text-center space-y-1">
                          <Droplets className={`h-5 w-5 mx-auto ${humidityStatus?.color}`} />
                          <p className="text-2xl font-bold">{reading.humidity_percent}%</p>
                          <p className="text-xs text-muted-foreground">{humidityStatus?.status}</p>
                        </div>
                        <div className="text-center space-y-1">
                          <Weight className="h-5 w-5 mx-auto text-primary" />
                          <p className="text-2xl font-bold">{reading.weight_kg}</p>
                          <p className="text-xs text-muted-foreground">kg</p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        Last updated: {new Date(reading.recorded_at).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">No sensor data available</p>
                    </div>
                  )}

                  <Dialog open={isAddingReading && selectedUnit === unit.id} onOpenChange={(open) => {
                    setIsAddingReading(open);
                    if (open) setSelectedUnit(unit.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={() => setSelectedUnit(unit.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sensor Reading
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Sensor Reading</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddReading} className="space-y-4">
                        <div>
                          <Label htmlFor="temperature">Temperature (°C)</Label>
                          <Input
                            id="temperature"
                            type="number"
                            step="0.1"
                            value={newReading.temperature_celsius}
                            onChange={(e) => setNewReading({ ...newReading, temperature_celsius: e.target.value })}
                            placeholder="e.g., 4.5"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="humidity">Humidity (%)</Label>
                          <Input
                            id="humidity"
                            type="number"
                            step="0.1"
                            value={newReading.humidity_percent}
                            onChange={(e) => setNewReading({ ...newReading, humidity_percent: e.target.value })}
                            placeholder="e.g., 90"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={newReading.weight_kg}
                            onChange={(e) => setNewReading({ ...newReading, weight_kg: e.target.value })}
                            placeholder="e.g., 850"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Reading</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StorageMonitor;