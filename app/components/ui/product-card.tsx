const ProductCard = ({ id, name, price, originalPrice, discount, image }) => {
  return (
    <div className="rounded-[40px] overflow-hidden shadow-lg"> {/* Ensure this class is applied */}
      <img src={image} alt={name} className="w-full h-auto" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-gray-600">{price}</p>
        {discount && <p className="text-red-500">{discount}% Off</p>}
      </div>
    </div>
  );
};