export default function CollectionHero({ title }: { title: string }) {
  return (
    <section className="bg-[#212121] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-[#d9d9d9] text-lg max-w-2xl mx-auto">
            Discover our premium athletic wear designed for peak performance and style.
          </p>
        </div>
      </div>
    </section>
  )
}
