export default function OrdersCard({ name, image, quantity, item }) {
  return (
    <>
      <div className="w-full mt-2">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div>
              <img src={image} alt="" className="w-30" />
            </div>
            <div>
              <div className="font-bold max-w-xs line-clamp-2">{name}</div>

              <div className="flex text-[15px] italic py-2 gap-2">
                Phân loại :
                <p className="text-[rgba(0,0,0,.54)]">
                  {item?.variant?.attributes
                    ?.map((attr) => `${attr.name}: ${attr.value}`)
                    .join(", ")}
                </p>
              </div>

              <p>x{quantity}</p>
            </div>
          </div>
          <div className="p-10 text-red-600 ">
            đ {item?.variant?.selling_price?.toLocaleString("vi-VN")}
          </div>
        </div>
      </div>
    </>
  );
}
