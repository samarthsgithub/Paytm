import PropTypes from "prop-types";

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}

ErrorBanner.propTypes = { message: PropTypes.string };
