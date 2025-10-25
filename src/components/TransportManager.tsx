import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Truck, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

const TransportManager = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isAddingRequest, setIsAddingRequest] = useState(false);

  const [newRequest, setNewRequest] = useState({
    batch_id: "",
    from_location: "",
    to_location: "",
    transport_date: "",
    vehicle_type: "",
    driver_name: "",
    driver_contact: ""
  });

  useEffect(() => {
    fetchRequests();
    fetchBatches();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("transport_requests")
      .select("*, produce_batches(produce_name, quantity_kg)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch transport requests");
      return;
    }

    setRequests(data || []);
  };

  const fetchBatches = async () => {
    const { data, error } = await supabase
      .from("produce_batches")
      .select("*")
      .eq("status", "in_storage");

    if (!error) {
      setBatches(data || []);
    }
  };

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("transport_requests")
      .insert(newRequest);

    if (error) {
      toast.error("Failed to create transport request");
      return;
    }

    toast.success("Transport request created successfully");
    setIsAddingRequest(false);
    setNewRequest({
      batch_id: "",
      from_location: "",
      to_location: "",
      transport_date: "",
      vehicle_type: "",
      driver_name: "",
      driver_contact: ""
    });
    fetchRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning text-white";
      case "confirmed":
        return "bg-info text-white";
      case "in_progress":
        return "bg-primary text-white";
      case "completed":
        return "bg-success text-white";
      case "cancelled":
        return "bg-destructive text-white";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Transport & Logistics</h2>
          <p className="text-muted-foreground">Coordinate produce delivery</p>
        </div>
        <Dialog open={isAddingRequest} onOpenChange={setIsAddingRequest}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Request Transport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Transport Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRequest} className="space-y-4">
              <div>
                <Label htmlFor="batch">Produce Batch</Label>
                <Select
                  value={newRequest.batch_id}
                  onValueChange={(value) => setNewRequest({ ...newRequest, batch_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select produce batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.produce_name} - {batch.quantity_kg} kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from">From Location</Label>
                  <Input
                    id="from"
                    value={newRequest.from_location}
                    onChange={(e) => setNewRequest({ ...newRequest, from_location: e.target.value })}
                    placeholder="e.g., Warehouse Delhi"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="to">To Location</Label>
                  <Input
                    id="to"
                    value={newRequest.to_location}
                    onChange={(e) => setNewRequest({ ...newRequest, to_location: e.target.value })}
                    placeholder="e.g., Market Mumbai"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="date">Transport Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRequest.transport_date}
                  onChange={(e) => setNewRequest({ ...newRequest, transport_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="vehicle">Vehicle Type</Label>
                <Input
                  id="vehicle"
                  value={newRequest.vehicle_type}
                  onChange={(e) => setNewRequest({ ...newRequest, vehicle_type: e.target.value })}
                  placeholder="e.g., Refrigerated Truck"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver_name">Driver Name</Label>
                  <Input
                    id="driver_name"
                    value={newRequest.driver_name}
                    onChange={(e) => setNewRequest({ ...newRequest, driver_name: e.target.value })}
                    placeholder="e.g., Amit Singh"
                  />
                </div>

                <div>
                  <Label htmlFor="driver_contact">Driver Contact</Label>
                  <Input
                    id="driver_contact"
                    value={newRequest.driver_contact}
                    onChange={(e) => setNewRequest({ ...newRequest, driver_contact: e.target.value })}
                    placeholder="e.g., +91 98765 43210"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">Create Request</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No transport requests found</p>
          <Button onClick={() => setIsAddingRequest(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Request
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {requests.map((request) => (
            <Card key={request.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.produce_batches?.produce_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {request.produce_batches?.quantity_kg} kg
                    </p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Route</p>
                      <p className="text-sm text-muted-foreground">
                        {request.from_location} → {request.to_location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Scheduled Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.transport_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.vehicle_type && (
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Vehicle Type</p>
                        <p className="text-sm text-muted-foreground">
                          {request.vehicle_type}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {request.driver_name && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Driver:</span>
                      <span className="font-medium">{request.driver_name}</span>
                    </div>
                    {request.driver_contact && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Contact:</span>
                        <span className="font-medium">{request.driver_contact}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground pt-2">
                  Created: {new Date(request.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransportManager;