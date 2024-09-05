import arcjet, { detectBot } from "@arcjet/next";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Error from "next/error";
import Head from "next/head";
import React from "react";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "DRY_RUN",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

type pageProps = {
  errorCode: number | false;
  errorText: string;
};

// getServerSideProps is called on the server before rendering the page
export const getServerSideProps = (async (context) => {
  const decision = await aj.protect(context.req);
  console.log("decision", decision);

  if (decision.isDenied()) {
    return {
      props: { pageProps: { errorCode: 403, errorText: "Access denied" } },
    };
  }

  return { props: { pageProps: { errorCode: false, errorText: "" } } };
}) satisfies GetServerSideProps<{
  pageProps: pageProps;
}>;

export default function Page({
  pageProps,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // If there is an error, render the Next.js error page
  if (pageProps.errorCode) {
    return (
      <Error statusCode={pageProps.errorCode} title={pageProps.errorText} />
    );
  }
  return (
    <>
      <Head>
        <title>Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div>
          <h2>Hello</h2>
        </div>
      </main>
    </>
  );
}
