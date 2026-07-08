import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';

export const WelcomeEmail = ({ name = 'Cultivador' }: { name?: string }) => (
  <Html>
    <Head />
    <Preview>Bienvenido a PranaKaia</Preview>
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
          <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
            ¡Bienvenido a la comunidad!
          </Heading>
          <Text className="text-black text-[14px] leading-[24px]">
            Hola {name}, gracias por unirte a PranaKaia.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WelcomeEmail;
