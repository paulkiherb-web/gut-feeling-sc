import BoostaTokenGrid from '@/components/tokens/BoostaTokenGrid';
import BoostaRareTokenShowcase from '@/components/tokens/BoostaRareTokenShowcase';

export default function TokenGallery() {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Boosta Tokens</h1>
      <p style={{ opacity: 0.7, marginBottom: 32 }}>
        Коллекция из 30 фирменных жетонов
      </p>
      <BoostaTokenGrid />
      <BoostaRareTokenShowcase />
    </div>
  );
}
