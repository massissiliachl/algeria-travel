import React, { useState, useEffect } from 'react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    tour: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const storedReviews = localStorage.getItem('algeria_travel_reviews');
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    } else {
      const defaultReviews = [
        { name: "Sophie Martin", tour: "Sahara Oasis Trek", rating: 5, comment: "Un voyage exceptionnel ! Les paysages sont à couper le souffle.", date: "2026-05-15" },
        { name: "Thomas Bernard", tour: "Constantine & Gorges", rating: 5, comment: "Constantine est une ville magnifique.", date: "2026-05-10" },
        { name: "Amira K.", tour: "Trésors de Tipaza", rating: 4, comment: "Très belle découverte des ruines romaines.", date: "2026-05-05" }
      ];
      setReviews(defaultReviews);
      localStorage.setItem('algeria_travel_reviews', JSON.stringify(defaultReviews));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      ...formData,
      date: new Date().toISOString().split('T')[0]
    };
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('algeria_travel_reviews', JSON.stringify(updatedReviews));
    setFormData({ name: '', tour: '', rating: 5, comment: '' });
    alert('✨ Merci pour votre avis !');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '0';

  return (
    <div className="reviews-section" id="reviews" data-aos="fade-up">
      <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Ce que nos voyageurs disent</h2>
      <p className="section-subtitle">Partagez votre expérience et lisez les témoignages de ceux qui ont voyagé avec nous</p>
      
      <div className="reviews-container">
        <div className="review-form-card" data-aos="fade-right">
          <h3><i className="fas fa-pen-alt"></i> Laissez votre avis</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" className="review-input" placeholder="Votre nom" value={formData.name} onChange={handleChange} required />
            <select name="tour" className="review-input" value={formData.tour} onChange={handleChange} required>
              <option value="">Choisissez votre circuit</option>
              <option value="Sahara Oasis Trek">🏜️ Sahara Oasis Trek</option>
              <option value="Constantine & Gorges">🌉 Constantine & Gorges</option>
              <option value="Trésors de Tipaza">🏛️ Trésors de Tipaza</option>
            </select>
            <div className="star-rating">
              {[5, 4, 3, 2, 1].map(star => (
                <React.Fragment key={star}>
                  <input type="radio" name="rating" id={`star${star}`} value={star} checked={formData.rating === star} onChange={handleChange} />
                  <label htmlFor={`star${star}`}><i className="fas fa-star"></i></label>
                </React.Fragment>
              ))}
            </div>
            <textarea name="comment" className="review-textarea" placeholder="Partagez votre expérience..." value={formData.comment} onChange={handleChange} required></textarea>
            <button type="submit" className="submit-review">📝 Publier mon avis</button>
          </form>
        </div>

        <div className="reviews-list" data-aos="fade-left">
          <div className="rating-summary">
            <div className="average-rating">
              <div className="average-number">{avgRating}</div>
              <div className="rating">
                {'★'.repeat(Math.floor(parseFloat(avgRating)))}
              </div>
              <div style={{ fontSize: '0.8rem' }}>sur 5</div>
            </div>
            <div><span>{reviews.length}</span> avis vérifiés</div>
          </div>
          <div>
            {reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <span className="review-name"><i className="fas fa-user-circle"></i> {review.name}</span>
                  <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <div className="review-date">{review.date}</div>
                <div className="review-comment">"{review.comment}"</div>
                <span className="review-tour"><i className="fas fa-map-marker-alt"></i> {review.tour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="testimonial" data-aos="fade-up">
        <div className="testimonial-quote">"</div>
        <p>Le voyage à Djanet a dépassé toutes nos espérances. Les guides connaissent le désert comme leur poche, et le thé sous la Voie Lactée restera gravé dans nos mémoires.</p>
        <div className="rating">
          <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
        </div>
        <p style={{ fontSize: '1rem', fontStyle: 'normal', fontWeight: 600, marginTop: '15px' }}>— Sophie & Marc L., Trekking Saharien</p>
      </div>
    </div>
  );
};

export default Reviews;