import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-9xl font-extrabold text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 btn-primary inline-flex items-center"
      >
        <FiArrowLeft className="mr-2" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
