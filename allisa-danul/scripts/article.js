'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT (Done): Why isn't this method written as an arrow function?
// Because it is using the contextual this.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // It is a conditional ternary operator used as a shorcut for if statements. The expression after the question mark is the true statement and the expression after the colon is the false statement.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT/Done: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// rawData is a key coming from localStorage which is pulled in the fetchAll function.  This is different because we are pulling this information from an emulated json source.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))

  Article.all.forEach(article => {
    $('#articles').append(article.toHtml())
  });
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {

    Article.loadAll(JSON.parse(localStorage.rawData));
    articleView.initIndexPage();

  } else {
    $.ajax({url: 'data/hackerIpsum.json', success: function(result) {
      //The sequence of the functions determines how everything will run.  We need to make sure that there is raw data to use before triggering the next functions which will populate the index page.
      localStorage.setItem('rawData', JSON.stringify(result));
      Article.loadAll(result);
      articleView.initIndexPage();
    }});
  }
}

