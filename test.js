var assert = require('assert');

var urltree = require('./');

describe('root node', function() {
  var root = urltree({});
  it('has an empty name', function() {
    assert.equal(root.$name, '');
  });
  it('has an empty path', function() {
    assert.equal(root.$path, '');
  });
  it('has undefined parent', function() {
    assert.equal(root.$parent, undefined);
  });
  it('has empty nodes', function() {
    assert.deepEqual(root.$nodes, {});
  });
  it('has an empty string', function() {
    assert.equal(root.toString(), '');
  });
  it('has an empty string (cast)', function() {
    assert.equal(root + '', '');
  });
});

describe('simple node', function() {
  var root = urltree({
    simple: '/are/you/classified/as/human'
  });
  var node = root.simple;
  it('has the right name', function() {
    assert.equal(node.$name, 'simple');
  });
  it('has the right path', function() {
    assert.equal(node.$path, 'simple');
  });
  it('has the right route', function() {
    assert.equal(node.$route, '/are/you/classified/as/human');
  });
  it('has empty nodes', function() {
    assert.deepEqual(node.$nodes, {});
  });
  it('points to root node', function() {
    assert.equal(node.$parent, root);
  });
});

describe('nested tree', function() {
  var root = urltree({
    'human': '/are/you/classified/as/human',
    'korben': 'korben',
    'korben.popsicle': 'negative/i/am/a/meat/popsicle',
    'korben.asks.for.priest': 'im/uh/looking/for/a/priest',
    'leelo.supreme': 'me/fifth/element/supreme/being/me/protect/you',
    'leelo.multipass': 'dallas/mul-ti-pass'
  });
  it('has the right paths', function() {
    assert.equal(root.human.$path, 'human');
    assert.equal(root.korben.$path, 'korben');
    assert.equal(root.korben.popsicle.$path, 'korben.popsicle');
    assert.equal(root.korben.asks.for.$path, 'korben.asks.for');
    assert.equal(root.leelo.supreme.$path, 'leelo.supreme');
    assert.equal(root.leelo.$path, 'leelo');
  });
  it('has the right routes', function() {
    assert.equal(root.human.$route, '/are/you/classified/as/human');
  });
  it('has the right nodes', function() {
    assert.equal(Object.keys(root.human.$nodes).length, 0);
    assert.equal(Object.keys(root.korben.popsicle.$nodes).length, 0);
    assert.equal(Object.keys(root.korben.asks.$nodes).length, 1);
    assert.equal(Object.keys(root.korben.asks.for.$nodes).length, 1);
    assert.equal(Object.keys(root.leelo.$nodes).length, 2);
  });
  it('has the right parents', function() {
    assert.equal(root.human.$parent, root);
    assert.equal(root.korben.popsicle.$parent, root.korben);
    assert.equal(root.korben.asks.for.priest.$parent, root.korben.asks.for);
    assert.equal(root.leelo.supreme.$parent, root.leelo);
    assert.equal(root.leelo.multipass.$parent, root.leelo);
  });
});

describe('node params', function() {
  var root = urltree({
    'home': '/',
    'user': '/user/:id',
    'file': '/file/list',
    'file.download': '/file/:id/download',
    'too.many.params': '/this/:has/to/:many-:params/:man'
  });
  it('can build urls', function() {
    assert.equal(root.home.build(), '/');
    assert.equal(root.user.build({id: '123'}), '/user/123');
    assert.equal(root.file.build(), '/file/list');
    assert.equal(root.file.download.build({id: '123'}), '/file/123/download');
    assert.equal(root.too.many.params.build(
      {has: 'HAS', man: 'MAN', many: 'MANY', params: 'PARAMS'}),
      '/this/HAS/to/MANY-PARAMS/MAN');
  });
  it('raises an error', function() {
    assert.throws(function() { root.user.build(); }, Error);
    assert.throws(function() { root.user.build(); }, /No param id/);
    assert.throws(
      function() { root.too.many.params.build({man: 'MAN'}); },
      /No param has/);
  });
});

describe('node conflicts', function() {
  it('does not allow overwriting methods', function() {
    var create = function() { urltree({'length': '/'}); };
    assert.throws(create, Error);
    assert.throws(create, /Node name length already in use/);
  });
  it('does not allow overwriting nodes', function() {
    var root = urltree({'home': '/', 'user': '/user/:id'});
    var create = function() {
      root.user.$name = 'home';
      root.$set(root.user);
    };
    assert.throws(create, Error);
    assert.throws(create, /Node name home already in use/);
  });
});
