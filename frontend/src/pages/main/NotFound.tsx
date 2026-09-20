import type { FC } from "react";
import GotoHome from "../../components/buttons/HomeButton";

const ErrorMsg = "Oops! We can’t find this page";
const ErrorDesc =
  "This page doesn’t exist. It looks like the link is broken or the page has been moved.";

const NotFoundPage: FC = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-10">
      <h1 className="text-center text-lg font-bold text-balance md:text-2xl">
        {ErrorMsg}
      </h1>
      <h2 className="text-md max-w-100 text-center text-balance md:max-w-200 md:text-xl">
        {ErrorDesc}
      </h2>
      <div className="mt-10">
        <GotoHome />
      </div>
    </div>
  );
};

export default NotFoundPage;
