import Hero from "@/components/Hero";
import CategoryShowcase from "@/components/CategoryShowcase";
import HowItWorks from "@/components/HowItWorks";
import SendFromAbroadBanner from "@/components/SendFromAbroadBanner";
import InstagramFollow from "@/components/InstagramFollow";
import TrendingSection from "@/components/TrendingSection";
import { getAllProducts, getTrendingProducts } from "@/lib/data/products";
import { getHeroSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trending, products, hero] = await Promise.all([
    getTrendingProducts(4),
    getAllProducts(),
    getHeroSettings(),
  ]);

  return (
    <main>
      <Hero backgroundUrl={hero.imageUrl} />

      <CategoryShowcase products={products} />

      <TrendingSection products={trending} />

      <HowItWorks />

      <SendFromAbroadBanner />

      <InstagramFollow />
    </main>
  );
}
