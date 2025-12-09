import VisibilityIcon from "@mui/icons-material/Visibility";

export default function CardView({
  data = [],
  fields = [],
  getImage,
  getTitle,
  onViewDetail,
  renderActions,
  emptyText = "Không có dữ liệu.",
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 p-4">
      {data.length === 0 ? (
        <div className="col-span-full text-center py-8 text-gray-500">
          {emptyText}
        </div>
      ) : (
        data.map((item, idx) => (
          <div
            key={item._id || idx}
            className="border border-gray-200 rounded-lg p-4 shadow bg-white flex flex-col"
          >
            <div className="flex items-center gap-3 mb-2">
              {getImage && (
                // <img
                //   src={getImage(item)}
                //   alt="avatar"
                //   className="w-12 h-12 object-cover rounded-full border"
                //   onError={(e) => (e.target.src = "")}
                // />
                <img
                  src={
                    getImage(item).trim() !== ""
                      ? getImage(item)
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={"avatar"}
                  className="w-12 h-12 object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      getTitle(item) || "User"
                    )}&background=0D8ABC&color=fff`;
                  }}
                />
              )}
              <div className="flex-1 font-bold text-base">
                {getTitle ? getTitle(item) : ""}
              </div>
              {renderActions && renderActions(item)}
              {onViewDetail && (
                <button
                  onClick={() => onViewDetail(item)}
                  className="text-blue-600 cursor-pointer hover:text-blue-800 p-2 rounded-full"
                  title="Xem chi tiết"
                >
                  <VisibilityIcon />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-1 my-1">
              {fields.map((f) => (
                <div key={f.key || f.label} className="flex my-1">
                  <span className="font-semibold min-w-[90px]">{f.label}:</span>
                  <span className="ml-1 break-all min-w-[100px]">
                    {f.render ? f.render(item) : item[f.key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
