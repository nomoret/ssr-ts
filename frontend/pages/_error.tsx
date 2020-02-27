import React from "react";

const MyError = ({ statusCode }: { statusCode: number }) => {
  return (
    <div>
      <h1>{statusCode} 에러 발생</h1>
    </div>
  );
};

MyError.defaultProps = {
  statusCode: 400
};

MyError.getInitialProps = async (context: any) => {
  const statusCode = context.res
    ? context.res.statusCode
    : context.err
    ? context.err.statusCode
    : null;
  return { statusCode };
};

export default MyError;
