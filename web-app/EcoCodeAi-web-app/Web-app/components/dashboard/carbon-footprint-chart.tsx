"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

export function CarbonFootprintChart() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .post("http://127.0.0.1:8080/api/status")
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching repository data:", error);
        setLoading(false);
      });
  }, []);

  function getRandomValue() {
    return Math.floor(Math.random() * 100) + 1; // Generates a random value between 1 and 100
  }
  
  const data = [
    { name: "JavaScript", value: getRandomValue() },
    { name: "Python", value: getRandomValue() },
    { name: "Other", value: getRandomValue() },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Carbon Footprint</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : "Distribution by language"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  <Cell key="cell-0" fill="hsl(var(--chart-1))" />
                  <Cell key="cell-1" fill="hsl(var(--chart-2))" />
                  <Cell key="cell-2" fill="hsl(var(--chart-3))" />
                  <Cell key="cell-3" fill="hsl(var(--chart-4))" />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--card-foreground))"
                  }}
                  formatter={(value) => [`${value}%`, "Carbon Impact"]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: "hsl(var(--card-foreground))" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}