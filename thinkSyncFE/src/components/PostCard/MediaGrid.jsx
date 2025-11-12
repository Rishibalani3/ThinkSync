import { motion } from "framer-motion";
import { buttonVariants } from "../../utils/animations";

const MediaGrid = ({ post, setActiveIndex }) => {
  if (!post.media?.length) return null;

  const mediaCount = post.media.length;

  const handleClick = (e, index) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {mediaCount === 1 && (
        <div className="relative">
          {post.media[0].type === "image" && (
            <motion.img
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
              src={post.media[0].url}
              alt="media"
              className="w-full max-h-[400px] object-cover cursor-pointer"
              onClick={(e) => handleClick(e, 0)}
              style={{ willChange: 'transform' }}
            />
          )}
          {post.media[0].type === "video" && (
            <video
              src={post.media[0].url}
              controls
              className="w-full max-h-[400px]"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {mediaCount === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
          {post.media.map((m, idx) => (
            <div key={m.id} className="relative">
              {m.type === "image" && (
                <motion.img
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  src={m.url}
                  alt="media"
                  className="w-full h-52 sm:h-64 object-cover cursor-pointer"
                  onClick={(e) => handleClick(e, idx)}
                  style={{ willChange: 'transform' }}
                />
              )}
              {m.type === "video" && (
                <video
                  src={m.url}
                  controls
                  className="w-full h-64 object-cover"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {mediaCount >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
          <div className="">
            {post.media[0].type === "image" && (
              <motion.img
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
                src={post.media[0].url}
                alt="media"
                className="w-full h-52 sm:h-64 object-cover cursor-pointer"
                onClick={(e) => handleClick(e, 0)}
                style={{ willChange: 'transform' }}
              />
            )}
          </div>

          <div className="grid grid-rows-2 gap-0.5 relative">
            {post.media.slice(1, 3).map((m, idx) => (
              <div key={m.id} className="relative">
                {m.type === "image" && (
                  <motion.img
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                    src={m.url}
                    alt="media"
                    className="w-full h-36 sm:h-32 object-cover cursor-pointer"
                    onClick={(e) => handleClick(e, idx + 1)}
                    style={{ willChange: 'transform' }}
                  />
                )}
                {idx === 1 && mediaCount > 3 && (
                  <div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold cursor-pointer"
                    onClick={(e) => handleClick(e, 3)} // start preview from 4th image
                  >
                    +{mediaCount - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGrid;
