"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Leaf, Zap, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export function DashboardStats() {
  const [stats, setStats] = useState({
    file_urls: [],
    emission_averages: {
      cpu_power: 0,
      ram_power: 0,
      energy_consumed: 0,
      emissions: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .post("http://127.0.0.1:8080/api/status") // Fetch data from Express backend
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching repository data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      {/* CPU Power Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU Power Usage</CardTitle>
          <Code2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.emission_averages.cpu_power} W
          </div>
          <p className="text-xs text-muted-foreground">
            Measured CPU power consumption
          </p>
        </CardContent>
      </Card>

      {/* RAM Power Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">RAM Power Usage</CardTitle>
          <Leaf className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.emission_averages?.energy_consumed
              ? `${Math.ceil(stats.emission_averages.ram_power * 1000) / 1000} kWh`
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Total energy consumed</p>
        </CardContent>
      </Card>

      {/* Energy Consumed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Energy Consumed</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.emission_averages?.energy_consumed
              ? `${Math.ceil(stats.emission_averages.energy_consumed * 1000) / 1000} kWh`
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Total energy consumed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carbon Emission</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.emission_averages?.energy_consumed
              ? `${Math.ceil(stats.emission_averages.emissions * 1000) / 1000} kWh`
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Total energy consumed</p>
        </CardContent>
      </Card>

      {/* Extracted Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Extracted Files</CardTitle>
          <FileText className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-muted-foreground">
            {stats.file_urls.length > 0 ? (
              stats.file_urls.map((url, index) => (
                <li key={index} className="mb-1">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {url}
                  </a>
                </li>
              ))
            ) : (
              <p>No files extracted.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
