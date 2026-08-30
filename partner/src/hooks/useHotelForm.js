import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { parseJsonField, stringifyJson } from '../components/ui';

export function buildInitialForm() {
  return {
    name: '',
    nameEn: '',
    nameAr: '',
    location: '',
    locationEn: '',
    locationAr: '',
    address: '',
    addressEn: '',
    addressAr: '',
    phone: '',
    lat: '',
    lng: '',
    desc: '',
    descEn: '',
    descAr: '',
    price: '',
    oldPrice: '',
    rating: '',
    stars: 3,
    availability: 'available',
    roomsAvailable: '',
    checkIn: '14:00',
    checkOut: '12:00',
    image: '',
    gallery: '[]',
    amenities: '{"fr":[],"en":[],"ar":[]}',
    published: false,
  };
}

function mapApiToForm(data) {
  return {
    name: data.name || '',
    nameEn: data.nameEn || '',
    nameAr: data.nameAr || '',
    location: data.location || '',
    locationEn: data.locationEn || '',
    locationAr: data.locationAr || '',
    address: data.address || '',
    addressEn: data.addressEn || '',
    addressAr: data.addressAr || '',
    phone: data.phone || '',
    lat: data.lat ?? '',
    lng: data.lng ?? '',
    desc: data.desc || '',
    descEn: data.descEn || '',
    descAr: data.descAr || '',
    price: data.price ?? '',
    oldPrice: data.oldPrice ?? '',
    rating: data.rating ?? '',
    stars: data.stars ?? 3,
    availability: data.availability || 'available',
    roomsAvailable: data.roomsAvailable ?? '',
    checkIn: data.checkIn || '14:00',
    checkOut: data.checkOut || '12:00',
    image: data.image || '',
    gallery: stringifyJson(data.gallery),
    amenities: stringifyJson(data.amenities),
    published: Boolean(data.published),
  };
}

export function useHotelForm() {
  const [form, setForm] = useState(buildInitialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api
      .getHotel()
      .then((data) => setForm(mapApiToForm(data)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const save = async (overrides = {}) => {
    setSaving(true);
    setError('');
    setSuccess('');
    const data = { ...form, ...overrides };
    try {
      const payload = {
        ...data,
        gallery: parseJsonField(data.gallery, []),
        amenities: parseJsonField(data.amenities, { fr: [], en: [], ar: [] }),
        price: data.price !== '' ? Number(data.price) : null,
        oldPrice: data.oldPrice !== '' ? Number(data.oldPrice) : null,
        rating: data.rating !== '' ? Number(data.rating) : null,
        stars: data.stars !== '' ? Number(data.stars) : null,
        roomsAvailable: data.roomsAvailable !== '' ? Number(data.roomsAvailable) : null,
        lat: data.lat !== '' ? Number(data.lat) : null,
        lng: data.lng !== '' ? Number(data.lng) : null,
        published: Boolean(data.published),
      };
      const updated = await api.updateHotel(payload);
      setForm(mapApiToForm(updated));
      setSuccess(data.published ? 'Publié sur le site avec succès.' : 'Modifications enregistrées.');
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { form, loading, saving, error, success, onChange, save, reload: load, setError, setSuccess };
}
