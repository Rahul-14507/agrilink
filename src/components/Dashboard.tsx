import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Warehouse, TrendingUp, Truck, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorageMonitor from "./StorageMonitor";
import ProduceTracker from "./ProduceTracker";
import MarketPrices from "./MarketPrices";
import TransportManager from "./TransportManager";
import AlertsPanel from "./AlertsPanel";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AgriLink</h1>
                <p className="text-sm text-muted-foreground">Smart Farm-to-Fork Platform</p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              Live Monitoring
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Warehouse className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2">
              <Warehouse className="h-4 w-4" />
              <span className="hidden sm:inline">Storage</span>
            </TabsTrigger>
            <TabsTrigger value="produce" className="gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Produce</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger value="transport" className="gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Transport</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Active Storage Units</CardDescription>
                  <CardTitle className="text-3xl text-primary">4</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card className="border-accent/20 shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Produce Batches</CardDescription>
                  <CardTitle className="text-3xl text-accent">12</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">8 in storage, 4 in transit</p>
                </CardContent>
              </Card>

              <Card className="border-success/20 shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Waste Reduction</CardDescription>
                  <CardTitle className="text-3xl text-success">28%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Compared to baseline</p>
                </CardContent>
              </Card>

              <Card className="border-warning/20 shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Active Alerts</CardDescription>
                  <CardTitle className="text-3xl text-warning">3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">2 warnings, 1 info</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertsPanel limit={5} />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start gap-2" onClick={() => setActiveTab("storage")}>
                    <Plus className="h-4 w-4" />
                    Add Storage Unit
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("produce")}>
                    <Plus className="h-4 w-4" />
                    Register Produce Batch
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("transport")}>
                    <Plus className="h-4 w-4" />
                    Request Transport
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="storage">
            <StorageMonitor />
          </TabsContent>

          <TabsContent value="produce">
            <ProduceTracker />
          </TabsContent>

          <TabsContent value="market">
            <MarketPrices />
          </TabsContent>

          <TabsContent value="transport">
            <TransportManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;