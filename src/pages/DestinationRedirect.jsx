import { Navigate, useParams } from 'react-router-dom';
import { getPlacePathFromTourId } from '../data/placeRoutes';

/** Redirige /destination/:id → /place/:slug (anciennes URLs) */
const DestinationRedirect = () => {
  const { id } = useParams();
  const to = getPlacePathFromTourId(id);
  return <Navigate to={to} replace />;
};

export default DestinationRedirect;
