import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, emptyMessage = 'No products found.' }) {
  if (!products.length) {
    return (
      <p className="rounded-2xl bg-white px-6 py-12 text-center text-sm text-neutral-500 ring-1 ring-neutral-100">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
