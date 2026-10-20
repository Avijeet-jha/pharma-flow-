function Welcome(props: { name: string; role: string }) {
  return (
    <>
      <h2>Welcome {props.name}</h2>
      <p>Role: {props.role}</p>
    </>
  );
}

export default Welcome;