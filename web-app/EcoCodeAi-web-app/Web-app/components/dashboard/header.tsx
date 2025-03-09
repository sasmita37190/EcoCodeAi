"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Github, Search } from "lucide-react";
import { useState, useEffect } from "react";

export function DashboardHeader() {
  const [repoUrl, setRepoUrl] = useState("");

  // Function to send repoUrl when it changes
  const handleScan = async (e) => {
    e.preventDefault(); // ✅ Page ka default reload behavior rokna zaroori hai
  
    if (!repoUrl.trim()) return; // Empty request bhejne se roke
  
    try {
      const response = await axios.post("http://localhost:8080/api/url", {
        repo_url: repoUrl,
      });
  
      console.log("Scan successful:", response.data);
  
      // ✅ Request successfully send hone ke baad hi page reload hoga
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1 second ka delay taaki user dekhe ki request successful thi
  
    } catch (error) {
      console.error("Error scanning repository:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your repositories' efficiency and carbon footprint
          </p>
        </div>

        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Github className="h-4 w-4" />
          Connect GitHub
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Scan GitHub Repository</h2>
        <form onSubmit={handleScan}> {/* ✅ Wrap input & button in a form */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter GitHub repository URL"
                className="pl-9"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
            <Button type="submit">Scan Now</Button> {/* ✅ Use "type=submit" to trigger form */}
          </div>
        </form>
      </div>
    </div>
  );
}
