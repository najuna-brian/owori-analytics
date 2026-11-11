// Site configuration and curriculum rules. Video data itself lives in data/channel.js
// and is refreshed with: node scripts/fetch-channel.mjs
window.SITE = {
  name: 'Owori Analytics',
  founder: 'Owori Benard',
  location: 'Uganda',
  // Add an address here and every "Get in touch" button becomes an email link.
  contactEmail: '',

  courses: [
    {
      key: 'spss',
      page: 'spss.html',
      playlist: /SPSS/i,
      software: 'SPSS',
      name: 'SPSS for Data Analysis',
      level: 'Beginner to advanced',
      tagline: 'From entering your first dataset to survival analysis, factor analysis and GEE.',
      blurb: 'The full research workflow in IBM SPSS: prepare your data, choose the right test, check assumptions, build the model and report the results the way journals and examiners expect.',
    },
    {
      key: 'stata',
      page: 'stata.html',
      playlist: /STATA/i,
      software: 'Stata',
      name: 'The Complete Beginner’s Guide to Stata',
      level: 'Beginner to advanced',
      tagline: 'Do-files, data management and every core test and regression model.',
      blurb: 'Learn Stata the reproducible way. Start with do-files and data management, then work through hypothesis tests, linear, logistic and count models, and Cox regression.',
    },
    {
      key: 'r',
      page: 'r.html',
      playlist: /R programming/i,
      software: 'R',
      name: 'R Programming for Data Analysis',
      level: 'Beginner',
      tagline: 'Install R, learn the language, then clean and reshape data with dplyr and tidyr.',
      blurb: 'A gentle start in R and RStudio for people who have never written code: data types, data structures, functions and loops, then real data wrangling with the tidyverse.',
    },
  ],

  // First matching rule wins. Order matters.
  topics: [
    { key: 'ai', name: 'AI for data analysis', test: /chatgpt|\bAI\b/i },
    { key: 'choosing', name: 'Choosing the right test', test: /parametric|when to use|choosing between|choosing the right/i },
    { key: 'r-tidyverse', name: 'Packages and the tidyverse', test: /dplyr|tidyr|packages in R/i },
    { key: 'r-basics', name: 'R fundamentals', test: /\bin R\b|R [Pp]rogramming|RStudio/ },
    { key: 'count', name: 'Count data: Poisson and negative binomial', test: /poisson|negative binomial/i },
    { key: 'survival', name: 'Survival analysis', test: /survival|\bcox\b|kaplan|log rank/i },
    { key: 'factor', name: 'Factor analysis', test: /factor analysis/i },
    { key: 'longitudinal', name: 'Longitudinal data and GEE', test: /longitudinal|generalized estimating/i },
    { key: 'logistic', name: 'Logistic regression', test: /logistic/i },
    { key: 'linear', name: 'Linear regression', test: /linear regression|equal variance/i },
    { key: 'correlation', name: 'Correlation', test: /correlation/i },
    { key: 'means', name: 't-tests and ANOVA', test: /\bt[ -]*test|anova|ancova|manova|normal distribution|check for normality/i },
    { key: 'categorical', name: 'Chi-square and categorical tests', test: /chi.?square|mcnemar|mantel/i },
    { key: 'descriptive', name: 'Descriptive statistics and graphs', test: /descriptive|plot graphs/i },
    { key: 'start', name: 'Getting started and managing data', test: /./ },
  ],

  // The order topics are shown in on the home page and in filters.
  topicOrder: ['start', 'descriptive', 'choosing', 'categorical', 'means', 'correlation', 'linear', 'logistic', 'count', 'survival', 'factor', 'longitudinal', 'r-basics', 'r-tidyverse', 'ai'],

  // Software-free explainers. These are suggested alongside both the SPSS and Stata lessons.
  concept: /^what is|^all types|parametric|types of correlation|which one should|when to use|choosing between|how to perform linear regression - steps|how to check for normal distribution/i,
};

// Decision tree for the Test Finder. A node is either a question with options or a result.
// Results list lessons by matching video titles, so new uploads appear automatically.
window.FINDER = {
  start: {
    q: 'What do you want to do with your data?',
    options: [
      { label: 'Describe or summarise it', hint: 'Frequencies, means, charts', go: 'describe' },
      { label: 'Compare groups', hint: 'Is there a difference between groups or time points?', go: 'compare' },
      { label: 'Measure a relationship', hint: 'How strongly are two variables associated?', go: 'relate' },
      { label: 'Build a regression model', hint: 'Predict an outcome or adjust for confounders', go: 'model' },
      { label: 'Analyse time to an event', hint: 'Survival, relapse, discharge, death', go: 'time' },
      { label: 'Reduce many items to a few factors', hint: 'Questionnaires and scales', go: 'factor' },
    ],
  },
  describe: { test: 'Descriptive statistics', why: 'Use frequencies and percentages for categorical variables. Use the mean and standard deviation for normally distributed numeric variables, and the median and interquartile range when they are skewed.', match: /descriptive|plot graphs|normal distribution|check for normality/i },
  compare: {
    q: 'What type of outcome are you comparing?',
    options: [
      { label: 'Numeric', hint: 'Blood pressure, weight, a test score', go: 'compareNum' },
      { label: 'Categorical', hint: 'Yes or no, cured or not, blood group', go: 'compareCat' },
    ],
  },
  compareNum: {
    q: 'How many groups or measurements are you comparing?',
    options: [
      { label: 'One group against a known value', go: 'oneT' },
      { label: 'Two independent groups', hint: 'Different people in each group', go: 'indT' },
      { label: 'Two related measurements', hint: 'Same people before and after, or matched pairs', go: 'pairedT' },
      { label: 'Three or more groups or time points', go: 'anova' },
    ],
  },
  oneT: { test: 'One-sample t-test', why: 'Compares the mean of a single group with a known or hypothesised value. The outcome should be roughly normally distributed.', match: /one sample t|normal distribution|check for normality/i },
  indT: { test: 'Independent samples t-test', why: 'Compares the means of two unrelated groups. Check normality and equal variances first. If the outcome is clearly not normal, use the non-parametric alternative, the Mann-Whitney U test.', match: /independent.*\bt[ -]*test|parametric vs/i },
  pairedT: { test: 'Paired samples t-test', why: 'Compares two measurements taken on the same people, or on matched pairs. The differences between the pairs should be roughly normal. The non-parametric alternative is the Wilcoxon signed-rank test.', match: /paired.*\bt[ -]*test|parametric vs/i },
  anova: {
    q: 'Which of these describes your design best?',
    options: [
      { label: 'One grouping factor', hint: 'Three or more independent groups', go: 'oneAnova' },
      { label: 'Two grouping factors', hint: 'For example treatment and sex, with their interaction', go: 'twoAnova' },
      { label: 'Groups, adjusting for a numeric covariate', go: 'ancova' },
      { label: 'Several numeric outcomes at once', go: 'manova' },
      { label: 'The same people measured three or more times', go: 'rmAnova' },
    ],
  },
  oneAnova: { test: 'One-way ANOVA', why: 'Compares the means of three or more independent groups defined by one factor. A significant result is followed by post-hoc tests to see which groups differ.', match: /one[ -]way anova|all types of anova/i },
  twoAnova: { test: 'Two-way ANOVA', why: 'Tests the effect of two factors on a numeric outcome, and whether the effect of one factor depends on the other (interaction).', match: /two[ -]way anova|all types of anova/i },
  ancova: { test: 'ANCOVA', why: 'Compares group means while adjusting for a numeric covariate, such as a baseline measurement.', match: /ancova|all types of anova/i },
  manova: { test: 'MANOVA', why: 'Compares groups on two or more related numeric outcomes in a single analysis.', match: /manova|all types of anova/i },
  rmAnova: { test: 'Repeated measures ANOVA', why: 'Compares three or more measurements taken on the same people over time or under different conditions.', match: /repeated measures anova|all types of anova/i },
  compareCat: {
    q: 'How are the groups arranged?',
    options: [
      { label: 'Independent groups', hint: 'Two categorical variables, different people in each group', go: 'chi' },
      { label: 'Paired or before-and-after', hint: 'The same people classified twice', go: 'mcnemar' },
      { label: 'An ordered exposure', hint: 'Does the proportion rise or fall across ordered categories?', go: 'trend' },
      { label: 'Independent groups, controlling for a third variable', go: 'mh' },
      { label: 'One variable against expected proportions', go: 'gof' },
    ],
  },
  chi: { test: 'Chi-square test of independence', why: 'Tests whether two categorical variables are associated. When expected counts are small, report Fisher’s exact test instead.', match: /chi.?square test for independence|all types of chi/i },
  mcnemar: { test: 'McNemar test', why: 'Compares paired proportions, for example the same participants classified before and after an intervention.', match: /mcnemar|all types of chi/i },
  trend: { test: 'Chi-square test for trend', why: 'Tests whether the proportion with the outcome increases or decreases across the ordered levels of an exposure.', match: /chi.?square test for trend|all types of chi/i },
  mh: { test: 'Mantel-Haenszel chi-square test', why: 'Tests the association between two categorical variables across the strata of a third, which lets you control for a confounder.', match: /mantel/i },
  gof: { test: 'Chi-square goodness of fit test', why: 'Tests whether the observed distribution of one categorical variable matches an expected distribution.', match: /goodness of fit test|all types of chi/i },
  relate: {
    q: 'What kind of variables are they?',
    options: [
      { label: 'Two numeric, roughly normal, linear relationship', go: 'pearson' },
      { label: 'Ordinal or skewed variables', go: 'spearman' },
      { label: 'Two numeric, controlling for a third variable', go: 'partial' },
      { label: 'One binary and one numeric', go: 'pointBiserial' },
      { label: 'Two categorical', go: 'chi' },
    ],
  },
  pearson: { test: 'Pearson correlation', why: 'Measures the strength and direction of a linear relationship between two normally distributed numeric variables.', match: /pearson|types of correlation/i },
  spearman: { test: 'Spearman or Kendall correlation', why: 'Rank-based correlations for ordinal data, skewed data, or relationships that are monotonic but not linear.', match: /spearman|kendall|types of correlation/i },
  partial: { test: 'Partial correlation', why: 'Measures the relationship between two numeric variables after removing the effect of a third.', match: /partial correlation|types of correlation/i },
  pointBiserial: { test: 'Point-biserial correlation', why: 'The correlation between a binary variable and a numeric variable. It is closely related to the independent samples t-test.', match: /point.?biserial|types of correlation/i },
  model: {
    q: 'What type of outcome are you modelling?',
    options: [
      { label: 'Numeric', hint: 'Blood pressure, birth weight, a score', go: 'linear' },
      { label: 'Binary', hint: 'Yes or no, disease or no disease', go: 'logistic' },
      { label: 'Three or more unordered categories', go: 'multinomial' },
      { label: 'Ordered categories', hint: 'Mild, moderate, severe', go: 'ordinal' },
      { label: 'A count', hint: 'Number of visits, cases or episodes', go: 'count' },
      { label: 'Repeated measurements on the same people', go: 'gee' },
      { label: 'Time to an event', go: 'cox' },
    ],
  },
  linear: { test: 'Linear regression', why: 'Models a numeric outcome from one or more predictors. Check linearity, independence, equal variance, normality of residuals, multicollinearity and influential points, then assess interaction and confounding before interpreting.', match: /linear regression|equal variance/i, exclude: /what is logistic/i },
  logistic: { test: 'Binary logistic regression', why: 'Models a yes or no outcome and reports odds ratios. When the outcome is common, modified Poisson regression gives prevalence or risk ratios that are easier to interpret.', match: /logistic|modified poisson/i, exclude: /multinomial|ordinal/i },
  multinomial: { test: 'Multinomial logistic regression', why: 'Models an outcome with three or more categories that have no natural order, comparing each with a reference category.', match: /multinomial|what is logistic/i },
  ordinal: { test: 'Ordinal logistic regression', why: 'Models an outcome whose categories have a natural order. It assumes proportional odds across the cut-points.', match: /ordinal logistic|what is logistic/i },
  count: {
    q: 'Is the variance of the count much larger than its mean?',
    options: [
      { label: 'No, or I am not sure yet', hint: 'Start here and check for overdispersion', go: 'poisson' },
      { label: 'Yes, the data are overdispersed', go: 'negbin' },
    ],
  },
  poisson: { test: 'Poisson regression', why: 'Models count outcomes and reports incidence rate ratios. Use an offset when the follow-up time or population differs between observations, and check for overdispersion.', match: /poisson/i, exclude: /modified/i },
  negbin: { test: 'Negative binomial regression', why: 'Models count outcomes when the variance is larger than the mean, which would make Poisson standard errors too small.', match: /negative binomial|offset/i },
  gee: { test: 'Generalized estimating equations (GEE)', why: 'Extends regression to repeated or clustered measurements by accounting for the correlation within each person. It works for numeric, binary and ordinal outcomes.', match: /generalized estimating/i },
  time: {
    q: 'What do you need from the analysis?',
    options: [
      { label: 'Describe survival and compare groups', go: 'km' },
      { label: 'Adjust for several predictors', go: 'cox' },
      { label: 'Handle predictors whose effect changes over time', go: 'extCox' },
    ],
  },
  km: { test: 'Kaplan-Meier curves and the log-rank test', why: 'Kaplan-Meier estimates the probability of surviving over time and handles censoring. The log-rank test compares the curves between groups.', match: /kaplan|log.?rank|what is survival/i },
  cox: { test: 'Cox proportional hazards regression', why: 'Models time to an event and reports hazard ratios adjusted for other predictors. Always check the proportional hazards assumption.', match: /cox|what is survival/i, exclude: /extended/i },
  extCox: { test: 'Extended Cox regression', why: 'Used when the proportional hazards assumption fails or a predictor changes over time. It adds time-dependent terms to the Cox model.', match: /extended cox|proportional hazards assumption/i },
  factor: { test: 'Factor analysis', why: 'Groups many correlated items, such as questionnaire responses, into a small number of underlying factors that can then be used in further analysis.', match: /factor analysis/i },
};
