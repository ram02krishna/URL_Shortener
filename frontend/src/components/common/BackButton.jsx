import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Back", onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/");
    }
  };

  return (
    <button onClick={handleClick} className="btn-secondary btn text-sm">
      ← {label}
    </button>
  );
};

export default BackButton;
