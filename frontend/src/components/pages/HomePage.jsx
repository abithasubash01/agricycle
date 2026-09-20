import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold tracking-tight text-gray-900 sm:text-6xl animate-fade-in-up">
              Turning Farm Waste into <span className="text-primary-600">Valuable Resources</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 animate-fade-in-up animate-delay-100">
              Connecting farmers with crop residue to industries that need it as raw material for biofuel, compost, packaging, and animal feed.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up animate-delay-200">
              <Link
                to="/farmer"
                className="rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:scale-105"
              >
                I am a Farmer
              </Link>
              <Link
                to="/buyer"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all hover:scale-105"
              >
                I am a Buyer
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-earth-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-earth-600">How it works</h2>
            <p className="mt-2 text-3xl font-heading font-bold tracking-tight text-gray-900 sm:text-4xl">
              A simple process for a cleaner future
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              {[
                {
                  name: '1. Estimate',
                  description: 'Farmers input their crop details. Our AI model accurately estimates the total crop residue generated.',
                  icon: '🌾',
                },
                {
                  name: '2. Match',
                  description: 'We instantly match available crop residue with verified industrial buyers in the region.',
                  icon: '🤝',
                },
                {
                  name: '3. Calculate',
                  description: 'See transparent transportation costs and net value before making any commitments.',
                  icon: '💰',
                },
              ].map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-2xl">
                      {feature.icon}
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
