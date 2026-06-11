import React from 'react';

const ToursSection = () => {
  const tours = [
    {
      id: 1,
      title: "Sahara Oasis Trek",
      description: "Trek au cœur du Tassili n'Ajjer, nuitées sous tente berbère.",
      image: "https://images.pexels.com/photos/2567327/pexels-photo-2567327.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "8 Jours",
      price: "1190 €",
      rating: 4.5,
      reviews: 156
    },
    {
      id: 2,
      title: "Constantine & Gorges",
      description: "Explorez la spectaculaire cité suspendue, ses ponts historiques.",
      image: "https://images.pexels.com/photos/1707958/pexels-photo-1707958.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "5 Jours",
      price: "850 €",
      rating: 5,
      reviews: 98
    },
    {
      id: 3,
      title: "Trésors de Tipaza",
      description: "Promenade côtière au milieu des vestiges antiques romains.",
      image: "https://images.pexels.com/photos/3585320/pexels-photo-3585320.jpeg?auto=compress&cs=tinysrgb&w=800",
      duration: "4 Jours",
      price: "690 €",
      rating: 4.5,
      reviews: 203
    }
  ];

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    return stars;
  };

  return (
    <div className="container" id="tours">
      <h2 className="section-title" data-aos="fade-up">Nos Voyages d'Exception</h2>
      <p className="section-subtitle" data-aos="fade-up">Du Grand Sud aux ruines antiques, vivez l'Algérie autrement</p>
      <div className="tours-grid">
        {tours.map((tour, index) => (
          <div className="tour-card" data-aos="fade-up" data-aos-delay={100 * (index + 1)} key={tour.id}>
            <div className="tour-img-wrapper">
              <div className="tour-img" style={{ backgroundImage: `url('${tour.image}')` }}></div>
            </div>
            <div className="tour-content">
              <h3>{tour.title}</h3>
              <p>{tour.description}</p>
              <div className="rating">
                {renderStars(tour.rating)}
                <span style={{ fontSize: '0.8rem' }}>({tour.reviews} avis)</span>
              </div>
              <div className="tour-info">
                <span className="duration"><i className="far fa-calendar-alt"></i> {tour.duration}</span>
                <span className="price">{tour.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToursSection;