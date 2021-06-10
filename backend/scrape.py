#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup
import time
import re
import json
import redis
import hashlib
# достает html код по указанной ссылке
def get_html(url):      
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
    rq = requests.get(url, headers=headers)
    print('Gettin HTML-code from ', url)
    return rq.text


# проверяет, есть ли на странице ссылки на вакансии
def is_empty(html):
    soup = BeautifulSoup(html, 'lxml')
    links = soup.find_all('a', class_='search-result-item__name')
    if links == []:
        return True
    else:
        return False
    


def get_and_save_area_codes():
    html = get_html('https://hh.ru/search/vacancy?area=113')
    time.sleep(.3)
    soup = BeautifulSoup(html, 'lxml')
    regex = r"&area=(\d*)&"
    # нашли все объекты, которые содержат название региона и его код
    pairs = soup.find('div', attrs={"data-toggle": "area"}).nextSibling.find('ul').find_all('li')
    pairs = [ x.find('a') for x in pairs ]
    for p in pairs[1:]:
        if not p:
            continue
        matches = re.search(regex, p['href']).groups()[0]
        print(p.find('span').text, matches)
    # выделяем текст региона и кода, записываем в файл
    return
    for pair in pairs:
        area = pair.find('span', class_='clusters-value__name').get_text()
        code = pair.get('href').split('&')[2].split('=')[1]
        print(area+' '+code)

    print('DONE')
    


# In[46]:


def parse_salary(salary):
    if salary == '':
        return {"amount": 0, "currency": 'RUB'}
    multiplier = 1.0
    if salary.endswith('до вычета налогов'):
        multiplier = 0.87
        
    currency = 'RUB'
    
    if 'USD' in salary:
        currency = 'USD'
        
    if 'EUR' in salary:
        currency = 'EUR'
        
    regex = r"(\d+\s?\d+)"
    match = re.search(regex, salary)
    base, = match.groups()
    int_amt = int(base.replace('\u202f', '').replace(' ','')) 
    return {"amount": int_amt, "currency": currency}

def get_offers_links(html, all_links):
    # новый объект класса BeutifulSoup
    soup = BeautifulSoup(html, 'lxml')
    links = soup.find_all('div', class_='vacancy-serp-item')
    
    for link in links:
        is_premium = 'vacancy-serp-item_premium' in link.get('class')
        link_parsed = link.find('a').get('href').split('?')
        salary = {}
        _ = link.find('span', attrs={'data-qa': 'vacancy-serp__vacancy-compensation'})
        if _ :
            salary = _.text.replace(u'\xa0', u' ')
            salary = parse_salary(salary)
        all_links.append({ 'link': link_parsed[0], 'isAdvert': is_premium, 'salary': salary})
    return len(links) # links found

def get_all_offers_links(query, area):
    # headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
    url_base = 'https://hh.ru/search/vacancy'
    url_text = '?text='+query
    url_area = '&area='+area
    url_page = '&page='

    # когда не найдем с помощью bs4 нужный элемент, то выставим его False
    # нужен для остановки цикла перебора всех страниц
    page_is_not_empty = True

    all_links = []
    page = 0

    while page_is_not_empty or page < 4:
        url = url_base + url_text + url_area + url_page + str(page)
        time.sleep(.5)
        html = get_html(url)
        n_links = get_offers_links(html, all_links)
        if n_links > 0:
            page += 1
        else:
            page_is_not_empty = False
    
    return all_links


# In[45]:


def sha1(x):
    return hashlib.sha1(str(x).encode('utf-8')).digest().hex()


# In[64]:


from markdownify import markdownify
def company_data(href, name):
    dic = {}
    url = 'http://hh.ru' + href
    html = get_html(url)
    soup = BeautifulSoup(html, 'lxml')
    img = soup.find('img', attrs={'data-qa': "company-logo-image"})
    a = soup.find('a', attrs={'data-qa': 'sidebar-company-site'})
    dic['name'] = name
    if img:
        dic['logo'] = img.get('src')
    dic['site'] = url  
    if a:
        dic['site'] = a['href']
    return dic
    
def extract_data(html):
    soup = BeautifulSoup(html, 'lxml')
    title = soup.find('h1', attrs={'data-qa':"vacancy-title"}).text
    body = soup.find('div', attrs={'data-qa':"vacancy-description"})
    comp = soup.find('a', class_="vacancy-company-name")
    if comp:
        company_name = comp.text.replace(u'\xa0', u' ')
        comp = company_data(comp['href'], company_name)
    return {'title':title,'company': comp, 'body': markdownify(str(body))}   

def rebuild_and_deep_index(r, urls):
    for url in urls:
        if url['salary'] == {}:
            print('no salary, skipping')
            continue
        html = get_html(url['link'])
        data = extract_data(html)
        data['link'] = url['link']
        data['salary'] = url['salary']
        data['isAdvert'] = url['isAdvert']
        print('saving')
        r.set(sha1(url['link']), json.dumps(data))


# In[65]:


