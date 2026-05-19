import { redirect } from "next/navigation";
import { getAllProperties } from "@/lib/data";

export async function generateStaticParams() {
  const properties = await getAllProperties();

  return properties.map((property) => ({
    id: property.id
  }));
}

export default async function PropertyDetailPage({ params }) {
  const resolvedParams = await params;
  redirect(`/kost/${resolvedParams.id}`);
}
