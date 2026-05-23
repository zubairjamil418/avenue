"use client";

export default function NewsletterForm({ accentColor }: { accentColor: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    // TODO: wire to newsletter API endpoint
    alert(`Thanks! ${email} has been subscribed.`);
    form.reset();
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        name="email"
        placeholder="Enter your email address"
        className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-white/60"
        required
      />
      <button
        type="submit"
        className="px-6 py-3 bg-white font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        style={{ color: accentColor }}
      >
        Subscribe
      </button>
    </form>
  );
}
