
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, ExternalLink, Clock, Newspaper, RefreshCw, Zap, Microscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
}

export default function NewsPage() {
  const [bbcNews, setBbcNews] = useState<NewsItem[]>([]);
  const [scienceNews, setScienceNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch both feeds in parallel using rss2json converter to bypass CORS
      const [bbcRes, scienceRes] = await Promise.all([
        fetch("https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml"),
        fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.newscientist.com/section/news/feed/")
      ]);

      const bbcData = await bbcRes.json();
      const scienceData = await scienceRes.json();

      if (bbcData.status === "ok") {
        setBbcNews(bbcData.items);
      }
      if (scienceData.status === "ok") {
        setScienceNews(scienceData.items);
      }

      if (bbcData.status !== "ok" && scienceData.status !== "ok") {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const NewsGrid = ({ items, source, colorClass }: { items: NewsItem[], source: string, colorClass: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, idx) => (
        <Card key={idx} className="glass-card flex flex-col group h-full">
          <div className="relative h-56 w-full overflow-hidden">
            <Image 
              src={item.thumbnail || `https://picsum.photos/seed/${source}-${idx}/600/400`} 
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute top-4 left-4">
              <Badge className={`${colorClass} bg-background/80 backdrop-blur-md border-primary/20 font-black uppercase text-[10px] tracking-widest px-3 py-1`}>
                {source}
              </Badge>
            </div>
          </div>
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
              <Clock className="h-3 w-3" />
              {new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <CardTitle className="text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-3">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
            <p className="text-muted-foreground font-medium line-clamp-3 mb-8 leading-relaxed">
              {item.description.replace(/<[^>]*>?/gm, '')}
            </p>
            <Button asChild className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl group/btn">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                Read Full Story
                <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="rounded-[2.5rem] border-2 overflow-hidden bg-card/40">
          <Skeleton className="h-48 w-full" />
          <div className="p-8 space-y-4">
            <Skeleton className="h-6 w-3/4 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl mt-4" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-16 max-w-6xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-primary/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Global Dashboard Sync</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Campus <span className="text-primary">News</span></h1>
          <p className="text-xl text-muted-foreground font-bold italic opacity-80">
            Live updates from World and Science feeds.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchNews} 
          disabled={loading}
          className="h-12 border-2 rounded-2xl font-black uppercase tracking-widest hover:bg-primary/5 transition-all shadow-lg px-8"
        >
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Feed
        </Button>
      </div>

      {error ? (
        <div className="py-40 text-center space-y-6 bg-destructive/5 rounded-[3rem] border-4 border-dashed border-destructive/20">
          <Newspaper className="h-20 w-20 mx-auto text-destructive opacity-20" />
          <div className="space-y-2">
            <h3 className="text-3xl font-black uppercase tracking-widest text-destructive">Connection Lost</h3>
            <p className="text-muted-foreground font-bold">Could not reach the news servers. Please try again.</p>
          </div>
          <Button onClick={fetchNews} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl">
            Retry Connection
          </Button>
        </div>
      ) : (
        <>
          {/* BBC SECTION */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center border-2 border-red-500/20">
                <Globe className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight uppercase italic">BBC World Feed</h2>
            </div>
            {loading ? <LoadingSkeleton /> : <NewsGrid items={bbcNews} source="BBC World" colorClass="text-red-600" />}
          </div>

          {/* NEW SCIENTIST SECTION */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pt-10 border-t-2 border-primary/5">
              <div className="h-10 w-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border-2 border-cyan-500/20">
                <Microscope className="h-5 w-5 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight uppercase italic">New Scientist Updates</h2>
            </div>
            {loading ? <LoadingSkeleton /> : <NewsGrid items={scienceNews} source="New Scientist" colorClass="text-cyan-600" />}
          </div>
        </>
      )}

      {!loading && !error && (
        <div className="text-center pt-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border-2 border-primary/10">
            <Zap className="h-4 w-4 text-primary fill-primary/20 animate-bolt" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stay informed, study smarter with StudySpark.</span>
          </div>
        </div>
      )}
    </div>
  );
}
