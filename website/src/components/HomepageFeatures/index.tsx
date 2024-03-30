import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'React Views',
    description: (
      <>
          Utilize React for building the presentation layer with efficiency and flexibility.
      </>
    ),
  },{
    title: 'Controllers and Services',
    description: (
      <>
          Controllers manage application logic and interact with services for shared logic functionalities.
      </>
    ),
  },
  {
    title: 'RxJS Integration',
    description: (
      <>
          Leverage RxJS for handling asynchronous operations, streamlining the process of preparing view data and managing side effects.
      </>
    ),
  },
  {
    title: 'Dependency Injection Container',
    description: (
      <>
          Easily assemble your application and manage dependencies, ensuring clean and maintainable code.
      </>
    ),
  },
  {
    title: 'Test Bed',
    description: (
      <>
          Includes a test environment specifically designed for testing the controllers within the framework.
      </>
    ),
  },
  {
    title: 'CLI Tooling',
    description: (
      <>
          Simplify the creation of new components with a convenient CLI command.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
          {Svg && <Svg className={styles.featureSvg} role="img"/>}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
