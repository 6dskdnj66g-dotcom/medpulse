import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://medpulse.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/",            priority: 1.0, changeFreq: "weekly"  },
    { path: "/dashboard",   priority: 0.9, changeFreq: "daily"   },
    { path: "/mdt",         priority: 0.9, changeFreq: "monthly" },
    { path: "/simulator",   priority: 0.9, changeFreq: "monthly" },
    { path: "/usmle",       priority: 0.9, changeFreq: "weekly"  },
    { path: "/encyclopedia",priority: 0.8, changeFreq: "weekly"  },
    { path: "/drug-checker",priority: 0.8, changeFreq: "monthly" },
    { path: "/ecg",         priority: 0.8, changeFreq: "monthly" },
    { path: "/professors",  priority: 0.8, changeFreq: "monthly" },
    { path: "/calculators", priority: 0.8, changeFreq: "monthly" },
    { path: "/library",     priority: 0.7, changeFreq: "weekly"  },
    { path: "/notes",       priority: 0.7, changeFreq: "monthly" },
    { path: "/summarizer",  priority: 0.7, changeFreq: "monthly" },
    { path: "/translator",  priority: 0.7, changeFreq: "monthly" },
    { path: "/progress",    priority: 0.6, changeFreq: "daily"   },
    { path: "/records",     priority: 0.6, changeFreq: "daily"   },
    { path: "/profile",     priority: 0.5, changeFreq: "monthly" },
    { path: "/auth/login",  priority: 0.5, changeFreq: "monthly" },
    { path: "/auth/register",priority:0.5, changeFreq: "monthly" },
  ] as const;

  return routes.map(({ path, priority, changeFreq }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority,
  }));
}
