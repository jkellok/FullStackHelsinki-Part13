-- Create table for blogs
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

-- Add two blogs
insert into blogs (author, url, title) values ('Dan Abramov', 'http://random-url.com', 'On let vs const');
insert into blogs (author, url, title, likes) values ('Laurenz Albe', 'http://another-url.com', 'Gaps in sequences in PostgreSQL', 10);