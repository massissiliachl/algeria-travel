/** Wilayas algériennes — filtre hôtels (codes officiels) */

export const WILAYAS = [
  { code: '06', key: 'bejaia', fr: 'Béjaïa', en: 'Bejaia', ar: 'بجاية' },
  { code: '16', key: 'alger', fr: 'Alger', en: 'Algiers', ar: 'الجزائر' },
  { code: '31', key: 'oran', fr: 'Oran', en: 'Oran', ar: 'وهران' },
  { code: '25', key: 'constantine', fr: 'Constantine', en: 'Constantine', ar: 'قسنطينة' },
  { code: '23', key: 'annaba', fr: 'Annaba', en: 'Annaba', ar: 'عنابة' },
  { code: '47', key: 'ghardaia', fr: 'Ghardaïa', en: 'Ghardaia', ar: 'غرداية' },
  { code: '11', key: 'tamanrasset', fr: 'Tamanrasset', en: 'Tamanrasset', ar: 'تمنراست' },
  { code: '33', key: 'illizi', fr: 'Illizi', en: 'Illizi', ar: 'إليزي' },
  { code: '08', key: 'bechar', fr: 'Béchar', en: 'Bechar', ar: 'بشار' },
  { code: '49', key: 'timimoun', fr: 'Timimoun', en: 'Timimoun', ar: 'تيميمون' },
  { code: '07', key: 'biskra', fr: 'Biskra', en: 'Biskra', ar: 'بسكرة' },
];

export const WILAYA_ALL = { code: 'all', key: 'all', fr: 'Toutes les wilayas', en: 'All wilayas', ar: 'كل الولايات' };

export const getWilayaByKey = (key) => WILAYAS.find((w) => w.key === key);

export const getWilayaByCode = (code) => WILAYAS.find((w) => w.code === code);
