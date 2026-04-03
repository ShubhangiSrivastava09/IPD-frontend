src / Hooks / cookie.jsx;
import { useCallback } from "react";
import Cookies from "js-cookie";

export default function useCookie() {
  const setCookie = useCallback(function (cname, cvalue, exdays = 30) {
    Cookies.set(cname, cvalue, {
      expires: exdays,
      path: "/",
      secure: true,
      sameSite: "None",
    });
    return true;
  }, []);

  const getCookie = useCallback(function (cname) {
    return Cookies.get(cname);
  }, []);

  return { setCookie, getCookie };
}

export const deleteCookie = function (cname) {
  Cookies.remove(cname, {
    path: "/",
    secure: true,
    sameSite: "None",
  });
  return true;
};
