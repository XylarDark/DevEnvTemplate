// File 106
// TEMPLATE_ONLY_START
function templateOnlyFunction106() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction106() {
  return 'production-106';
}

// @template-only
const templateVar106 = 'should be removed';

module.exports = {
  productionFunction106
};
