import Footer from "@/components/layout/Footer";

// app/about/page.tsx
export default function AboutPage() {
  return (
    <main className="bg-white text-gray-800">
      <section className="relative bg-linear-to-r from-gray-800 to-gray-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Woldia University</h1>
          <p className="text-xl italic">Open Mind, Open Eyes</p>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Woldia University</h2>
          <p className="text-gray-600 leading-relaxed">
            Established in 2011 (2004 E.C.), Woldia University (WoU) stands as a beacon of higher learning in the North Wollo Zone. 
            Born from Ethiopia's strategic vision to expand quality education, WoU has evolved into a dynamic center of academic 
            excellence, research, and community service.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md border-l-8 border-gray-700">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To produce competent and problem-solving graduates through quality education, conducting demand-driven research, 
                and providing need-based community services to foster socio-economic transformation.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border-l-8 border-gray-700">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become a top-tier, research-intensive Ethiopian university by 2030, recognized internationally for innovation, 
                green technology, and integrated development.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Core Values</h2>
        <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto text-center">
          {["Quality First", "Equity & Inclusion", "Innovation", "Integrity", "Sustainability"].map((value) => (
            <div key={value} className="bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Strategic Pillars</h2>
          <div className="overflow-x-auto max-w-4xl mx-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <tbody>
                {[
                  ["🎓 Academic Excellence", "Modernized curricula, digital learning, faculty development"],
                  ["🔬 Demand-Driven Research", "Agriculture, renewable energy, health sciences, dryland farming"],
                  ["🤝 Community Engagement", "Extension services, business incubation, literacy programs"],
                  ["🌿 Green Campus Initiative", "Carbon-neutral goals, water harvesting, waste-to-energy"]
                ].map(([pillar, focus], index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4 font-bold text-gray-800">{pillar}</td>
                    <td className="p-4 text-gray-600">{focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Colleges</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            "Business and Economics",
            "Natural and Computational Sciences",
            "Agriculture",
            "Health Sciences",
            "Social Sciences and Humanities",
            "Engineering and Technology"
          ].map((college, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition border border-gray-200">
              <p className="font-semibold text-gray-800">{college}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-6 text-sm">
          *Offering 40+ Undergraduate, 25+ Master's, and 5 PhD programs
        </p>
      </section>


      <section className="py-16 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto bg-gray-100 p-8 rounded-lg italic">
          <p className="text-xl text-gray-700">
            "Woldia University is more than a place of lectures and exams. We are a family of scholars committed to 
            lifting our region out of poverty through the power of knowledge."
          </p>
          <p className="mt-4 font-bold text-gray-800 not-italic"> Dr. [Abebe Girma], President of Woldia University</p>
        </div>
      </section>

        <Footer/>
    </main>
  );
}