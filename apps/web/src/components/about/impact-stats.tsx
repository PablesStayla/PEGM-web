'use client';

export function ImpactStats() {
  const stats = [
    {
      number: '10.000+',
      label: 'Cultivadores Empoderados',
      description: 'Cultivadores en todo el mundo confían en nuestras soluciones',
      icon: '👥',
    },
    {
      number: '98%',
      label: 'Tasa de Éxito',
      description: 'Resultados comprobados con nuestra genética premium',
      icon: '🎯',
    },
    {
      number: '50+',
      label: 'Países Atendidos',
      description: 'Alcance global con experiencia local',
      icon: '🌍',
    },
    {
      number: '5 Años',
      label: 'Liderazgo en la Industria',
      description: 'Pioneros en excelencia desde 2020',
      icon: '🏆',
    },
    {
      number: '100%',
      label: 'Compromiso Orgánico',
      description: 'Cultivo sostenible y libre de químicos',
      icon: '🌱',
    },
    {
      number: '24/7',
      label: 'Soporte Experto',
      description: 'Equipo dedicado disponible las 24 horas',
      icon: '💬',
    },
  ];

  return (
    <section className="py-20 bg-linear-to-br from-green-900 via-green-800 to-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Nuestro Impacto en Números</h2>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Resultados medibles que demuestran nuestro compromiso con la excelencia y el poder
            transformador del cultivo consciente.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-green-300">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-3 text-white">{stat.label}</div>
              <div className="text-green-100 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Impact Story */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              Historias de Transformación
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="text-3xl">📈</div>
                <div className="text-2xl font-bold text-green-300">300%</div>
                <div className="text-white font-medium">Aumento Promedio de Rendimiento</div>
                <div className="text-green-200 text-sm">Con nuestras soluciones premium</div>
              </div>
              <div className="space-y-3">
                <div className="text-3xl">💰</div>
                <div className="text-2xl font-bold text-green-300">$50K+</div>
                <div className="text-white font-medium">Crecimiento en Ingresos</div>
                <div className="text-green-200 text-sm">Por cultivador anualmente</div>
              </div>
              <div className="space-y-3">
                <div className="text-3xl">🌟</div>
                <div className="text-2xl font-bold text-green-300">4.9/5</div>
                <div className="text-white font-medium">Satisfacción del Cliente</div>
                <div className="text-green-200 text-sm">En todos nuestros servicios</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
