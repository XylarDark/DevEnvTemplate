// File 42
// TEMPLATE_ONLY_START
function templateOnlyFunction42() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction42() {
  return 'production-42';
}

// @template-only
const templateVar42 = 'should be removed';

module.exports = {
  productionFunction42
};
