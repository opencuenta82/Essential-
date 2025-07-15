
export const loader = async ({ request }) => {
  const verification = verifySecurityHeaders(request);
  
  const response = json({
    message: "Testing security headers",
    verification,
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url
  });
  
  return setSecurityHeaders(request, response);
};
