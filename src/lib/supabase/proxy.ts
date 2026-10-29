import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function updateSession(
  request: NextRequest,
) {
  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(
            cookiesToSet,
            headers,
          ) {
            /*
             * Keep the refreshed cookies available
             * to the current request.
             */
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            /*
             * Rebuild the response after Supabase
             * refreshes the session.
             */
            supabaseResponse =
              NextResponse.next({
                request,
              });

            /*
             * Send refreshed auth cookies
             * back to the browser.
             */
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                supabaseResponse.cookies.set(
                  name,
                  value,
                  options,
                );
              },
            );

            /*
             * Preserve any additional headers
             * returned by Supabase Auth.
             */
            Object.entries(
              headers,
            ).forEach(
              ([
                key,
                value,
              ]) => {
                supabaseResponse.headers.set(
                  key,
                  value,
                );
              },
            );
          },
        },
      },
    );

  /*
   * Verify / refresh the auth token.
   *
   * Do not use getSession() here for authorization.
   */
  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const isLoggedIn =
    Boolean(
      claimsData?.claims,
    );

  const pathname =
    request.nextUrl.pathname;

  const isLoginPage =
    pathname === "/login";

  const isConfirmRoute =
    pathname ===
    "/auth/confirm";

  /*
   * Helper for redirects.
   *
   * We need to preserve cookies that Supabase
   * may have refreshed during getClaims().
   */
  function createRedirect(
    pathname: string,
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      pathname;

    url.search = "";

    const response =
      NextResponse.redirect(
        url,
      );

    /*
     * Next.js ResponseCookies does not reliably
     * expose setAll() across versions,
     * so copy cookies individually.
     */
    supabaseResponse.cookies
      .getAll()
      .forEach(
        (cookie) => {
          response.cookies.set(
            cookie,
          );
        },
      );

    /*
     * Preserve auth/cache-related headers.
     */
    [
      "cache-control",
      "expires",
      "pragma",
    ].forEach(
      (headerName) => {
        const value =
          supabaseResponse.headers.get(
            headerName,
          );

        if (value) {
          response.headers.set(
            headerName,
            value,
          );
        }
      },
    );

    return response;
  }

  /*
   * Not logged in:
   *
   * Allow login + email confirmation,
   * but protect the Planora workspace.
   */
  if (
    !isLoggedIn &&
    !isLoginPage &&
    !isConfirmRoute
  ) {
    return createRedirect(
      "/login",
    );
  }

  /*
   * Already logged in:
   *
   * Visiting /login should return
   * the user to their workspace.
   */
  if (
    isLoggedIn &&
    isLoginPage
  ) {
    return createRedirect(
      "/",
    );
  }

  return supabaseResponse;
}