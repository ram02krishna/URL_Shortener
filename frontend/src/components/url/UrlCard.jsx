import toast from "react-hot-toast";
import { getShortUrl } from "../../utils/urlFormat";

const UrlCard = ({ url }) => {
  const shortUrl = getShortUrl(url.shortCode);

  const copy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow hover:scale-[1.02] transition">
      <p className="text-sm truncate">{url.originalUrl}</p>

      <div className="flex justify-between items-center mt-2">
        <a
          href={shortUrl}
          target="_blank"
          className="text-blue-500 font-semibold"
        >
          {shortUrl}
        </a>
        <button
          onClick={copy}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
        >
          Copy
        </button>
      </div>

      <p className="text-xs mt-2">Clicks: {url.clicks}</p>
    </div>
  );
};

export default UrlCard;
