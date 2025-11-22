import Link from "next/link"

export function ProblemSolutionsSection() {
  return (
    <section className="mt-16 md:mt-20 py-12 md:py-16 bg-white">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-wide text-orange-500/80 uppercase">
              More ways to use Imgsharer
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Fix blurry photos and enhance images with AI
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
              Choose the option that matches your problem best. All tools use the same secure, AI-powered engine behind
              Imgsharer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 backdrop-blur p-5 md:p-6 h-full flex flex-col">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 text-lg">
                <span role="img" aria-hidden="true">
                  ✨
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Fix blurry photos</h3>
              <p className="mt-2 text-sm text-slate-600">
                Upload a blurry picture and let our AI sharpen faces, edges, and fine details in seconds.
              </p>
              <div className="mt-auto pt-3 border-t border-slate-100">
                <Link
                  href="/blurry-photo"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-[#FF6B35] text-white text-sm font-medium py-2.5 hover:bg-[#ff8154] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B35]"
                >
                  Fix blurry photo
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 backdrop-blur p-5 md:p-6 h-full flex flex-col">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 text-lg">
                <span role="img" aria-hidden="true">
                  🪄
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Free image enhancer</h3>
              <p className="mt-2 text-sm text-slate-600">
                Improve photo clarity and contrast for free, without installing any apps or plugins.
              </p>
              <div className="mt-auto pt-3 border-t border-slate-100">
                <Link
                  href="/image-enhancer-free"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-[#FF6B35] text-white text-sm font-medium py-2.5 hover:bg-[#ff8154] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B35]"
                >
                  Enhance my image
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 backdrop-blur p-5 md:p-6 h-full flex flex-col">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 text-lg">
                <span role="img" aria-hidden="true">
                  💡
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Why are my photos blurry?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Learn the common causes of blurry photos and use Imgsharer’s AI to make pictures clearer in a few clicks.
              </p>
              <div className="mt-auto pt-3 border-t border-slate-100">
                <Link
                  href="/make-picture-clear"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-[#FF6B35] text-white text-sm font-medium py-2.5 hover:bg-[#ff8154] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B35]"
                >
                  Learn &amp; fix
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
