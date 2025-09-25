import { motion } from "framer-motion";

const MediaGrid = ({ post, setActiveIndex }) => {
  if (!post.media?.length) return null;

  const mediaCount = post.media.length;

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {mediaCount === 1 && (
        <div className="relative">
          {post.media[0].type === "image" && (
            <motion.img
              whileHover={{ scale: 1.02 }}
              src={post.media[0].url}
              alt="media"
              className="w-full max-h-[400px] object-cover cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(0);
              }}
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
        <div className="grid grid-cols-2 gap-0.5">
          {post.media.slice(0, 2).map((m, idx) => (
            <div key={m.id} className="relative">
              {m.type === "image" && (
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={m.url}
                  alt="media"
                  className="w-full h-64 object-cover cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                  }}
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
        <div className="grid grid-cols-2 gap-0.5">
          <div className="relative">
            {post.media[0].type === "image" && (
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={post.media[0].url}
                alt="media"
                className="w-full h-64 object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(0);
                }}
              />
            )}
          </div>
          <div className="grid grid-rows-2 gap-0.5">
            {post.media.slice(1, 3).map((m, idx) => (
              <div key={m.id} className="relative">
                {m.type === "image" && (
                  <motion.img
                    whileHover={{ scale: 1.02 }}
                    src={m.url}
                    alt="media"
                    className="w-full h-32 object-cover cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(idx + 1);
                    }}
                  />
                )}
                {idx === 1 && mediaCount > 3 && (
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                    className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xl font-bold cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(idx + 1);
                    }}
                  >
                    +{mediaCount - 3}
                  </motion.div>
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
