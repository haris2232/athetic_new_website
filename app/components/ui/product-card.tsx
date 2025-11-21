const ProductCard = ({ id, name, price, originalPrice, discount, image }) => {
  // Format price function to remove decimals
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹${Math.round(price)}`;
    }
    if (typeof price === 'string') {
      // If price is already a string like "₹80.00", remove the decimal part
      return price.replace(/\.00$/, '');
    }
    return price;
  };

  return (
    <div className="rounded-[40px] overflow-hidden shadow-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Image container with rounded top */}
      <div className="rounded-t-[40px] overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300" 
        />
      </div>
      
      {/* Content container with rounded bottom */}
      <div className="p-6 rounded-b-[40px] bg-white">
        {/* Changed text-lg to text-md for smaller title */}
        <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2">{name}</h3>
        
        <div className="flex items-center gap-3 mb-2">
          <p className="text-xl font-bold text-gray-900">{formatPrice(price)}</p>
          {originalPrice && (
            <p className="text-lg text-gray-500 line-through">{formatPrice(originalPrice)}</p>
          )}
        </div>
        
        {discount && (
          <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {discount}% Off
          </div>
        )}
      </div>
    </div>
  );
};